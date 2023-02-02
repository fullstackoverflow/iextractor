# Iextractor

Iextractor 是一个命令行工具，旨在从 Typescript 类中提取并转化为接口声明。支持批量转化和打包到单个文件。

安装

使用 npm 安装：

```
npm install -g @tosee/iextractor
```
使用

命令行使用方法如下：

```
iet [--pack] [--force] <input> <output>
```
选项说明：

--pack：将所有提取的接口声明打包到单个文件。

--force：强制覆盖输出文件。

\<input>：要提取的源文件/目录。

\<output>：接口声明的输出文件/目录。

例如：

```
iet src/**/*.ts ./output_dir
```
这将从 src 目录中的所有 .ts 文件中提取接口声明并输出到 ./output_dir 目录。

```
iet --pack src/**/*.ts ./output.ts
```
这将从 src 目录中的所有 .ts 文件中提取接口声明并将其打包输出到单个文件 ./output.ts。

## 许可证

该项目使用 MIT 许可证开源。