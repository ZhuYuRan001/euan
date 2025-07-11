import { Button, Upload } from "antd";
import type { UploadChangeParam, UploadProps } from "antd/es/upload";
import * as React from "react";

interface ChunkUploderProps {
  uploadProps?: UploadProps;
}

export const ChunkUploader: React.FC<ChunkUploderProps> = ({ uploadProps }) => {
  const uploadOnChange = (e: UploadChangeParam) => {
    console.log(e);
  };
  return (
    <div>
      <Upload onChange={uploadOnChange} {...uploadProps}>
        <Button>点击上传</Button>
      </Upload>
    </div>
  );
};
