"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const clipanion_1 = require("clipanion");
const ts_morph_1 = require("ts-morph");
(0, clipanion_1.runExit)(class MainCommand extends clipanion_1.Command {
    constructor() {
        super(...arguments);
        this.input = clipanion_1.Option.String({ required: true });
        this.output = clipanion_1.Option.String({ required: true });
        this.pack = clipanion_1.Option.Boolean(`--pack`, false);
        this.force = clipanion_1.Option.Boolean(`--force`, false);
    }
    check(output, pack, force) {
        let dir = false;
        if (!(0, fs_1.existsSync)(output)) {
            if (pack === false) {
                (0, fs_1.mkdirSync)(output, { recursive: true });
                dir = true;
            }
        }
        else {
            if ((0, fs_1.statSync)(output).isDirectory()) {
                if ((0, fs_1.readdirSync)(output).length != 0 && force === false) {
                    throw new clipanion_1.UsageError(`output directory:${output} is not empty, make sure and use --force to cover the content`);
                }
                else {
                    dir = true;
                }
            }
            else {
                if (pack === true) {
                    if (force === false) {
                        throw new clipanion_1.UsageError(`output file:${output} is exists, make sure and use --force to cover the content`);
                    }
                }
                else {
                    throw new clipanion_1.UsageError(`output directory:${output} is a file, make sure the path is right`);
                }
            }
        }
        return dir;
    }
    async execute() {
        const dir = this.check(this.output, this.pack, this.force);
        console.log("dir:", dir);
        console.log(this.input, this.output, this.pack, this.force);
        const project = new ts_morph_1.Project();
        project.addSourceFilesAtPaths(this.input);
        const sourceFiles = project.getSourceFiles();
        if (dir) {
            sourceFiles.forEach(sourceFile => {
                const output_interface = project.createSourceFile((0, path_1.join)(this.input, (0, path_1.relative)(__dirname, sourceFile.getFilePath())), undefined, { overwrite: true });
                const classes = sourceFile.getClasses();
                const interfaces = classes.map(classs => classs.extractInterface());
                output_interface.addInterfaces(interfaces.map(i => {
                    return { ...i, ...{ isExported: true } };
                }));
            });
        }
        else {
            const output_interface = project.createSourceFile(this.output, undefined, { overwrite: true });
            sourceFiles.forEach(sourceFile => {
                const classes = sourceFile.getClasses();
                const interfaces = classes.map(classs => classs.extractInterface());
                output_interface.addInterfaces(interfaces.map(i => {
                    return { ...i, ...{ isExported: true } };
                }));
            });
        }
        await project.save();
    }
});
