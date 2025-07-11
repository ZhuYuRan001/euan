import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import i18next from "i18next";
// 从虚拟模块导入自动生成的资源
import { ns, resources } from "virtual:i18n-resources";

// 初始化i18next
i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // 把资源文件放在 resources 中
    resources,
    ns, // 命名空间
    nsSeparator: ".", // 命名空间分隔符。比如 'home.hello' 对应的 home: { hello: '...' }
    keySeparator: ".", // 符号分割key，比如 'home.nest.key' 对应的 home: { nest: { key: '...' } }
    interpolation: {
      escapeValue: false // react已经做了xss防护
    },
    // 默认语言。如果没有对应的语言，就使用en
    fallbackLng: ["zh"],
    debug: import.meta.env.DEV, // 开发阶段开启debug
    // 设置探测规则
    detection: {
      // 探测优先级，最前面的优先级最高
      order: ["localStorage", "querystring", "cookie"],
      // 把语言缓存到cookie和localStorage中
      caches: ["cookie", "localStorage"],
      // 探测url的query参数中的lang
      lookupQuerystring: "lang",
      // 探测localStorage中的lang字段
      lookupLocalStorage: "lang",
      // 探测cookie中的lang字段
      lookupCookie: "lang"
    }
  });
