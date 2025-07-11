import path from "path";
import fs from "fs";
import { glob } from "glob";
import type { Plugin, ViteDevServer } from "vite";

interface Options {
  localesDir: string;
  watchPattern: string;
}

export default function i18nAutogen(
  options: Options = { localesDir: "", watchPattern: "" }
): Plugin {
  const {
    localesDir = "src/locales", // 本地化文件目录
    // outputFile = "i18n-config.js", // 目标配置文件
    watchPattern = "**/*.json" // 监听的文件模式
  } = options;

  // 辅助函数：标准化路径为Unix格式
  const toUnixPath = (p: string) => p.replace(/\\/g, "/");

  // 辅助函数：获取绝对路径
  const getAbsolutePath = (relativePath: string) =>
    toUnixPath(path.resolve(process.cwd(), relativePath));
  const virtualModuleId = "virtual:i18n-resources";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  // 生成 resources 和 ns 数据
  const generateI18nData = () => {
    const resources: Record<string, Record<string, string>> = {};
    const ns = new Set<string>();
    // 获取绝对路径并转换为Unix格式
    const baseDir = getAbsolutePath(localesDir);
    const pattern = toUnixPath(watchPattern);

    // 使用cwd选项确保正确解析
    const localeFiles = glob.sync(pattern, {
      cwd: baseDir,
      absolute: true,
      nodir: true
    });
    localeFiles.forEach((file) => {
      const relativePath = path.relative(localesDir, file);
      const [lng, ...nsParts] = relativePath.split(path.sep);
      const namespace = nsParts.join("/").replace(/\.json$/, "");

      if (!resources[lng]) resources[lng] = {};
      ns.add(namespace);

      try {
        resources[lng][namespace] = JSON.parse(fs.readFileSync(file, "utf-8"));
      } catch (err) {
        console.error(`Error parsing ${file}:`, err);
      }
    });

    return {
      resources,
      namespaces: Array.from(ns)
    };
  };

  return {
    name: "vite-plugin-i18n-autogen",
    enforce: "pre",

    // 解析虚拟模块
    resolveId(id: string | undefined) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    // 加载虚拟模块内容
    load(id: string | undefined) {
      // console.log(id);
      if (id === resolvedVirtualModuleId) {
        const { resources, namespaces } = generateI18nData();
        return `
          export const resources = ${JSON.stringify(resources, null, 2)};
          export const ns = ${JSON.stringify(namespaces)};
        `;
      }
    },

    // 开发服务器配置
    configureServer(server: ViteDevServer) {
      const updateVirtualModule = () => {
        const module = server.moduleGraph.getModuleById(
          resolvedVirtualModuleId
        );
        if (module) {
          server.moduleGraph.invalidateModule(module);
          server.ws.send({
            type: "full-reload",
            path: "*"
          });
        }
      };

      // 监听文件变化
      server.watcher.add(getAbsolutePath(localesDir));
      server.watcher.on("add", updateVirtualModule);
      server.watcher.on("change", updateVirtualModule);
      server.watcher.on("unlink", updateVirtualModule);
      server.watcher.on("all", updateVirtualModule);
    },

    // 构建时生成资源
    buildStart() {
      this.addWatchFile(path.join(localesDir, watchPattern));
    }
  };
}
