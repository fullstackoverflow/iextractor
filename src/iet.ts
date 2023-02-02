import { existsSync, mkdirSync, statSync, readdirSync } from 'fs';
import { relative, join } from 'path';
import { Command, Option, runExit, UsageError } from 'clipanion';
import { Project } from 'ts-morph';

runExit(class MainCommand extends Command {
    input = Option.String({ required: true });
    output = Option.String({ required: true });

    pack = Option.Boolean(`--pack`, false);
    force = Option.Boolean(`--force`, false);

    protected check(output: string, pack: boolean, force: boolean) {
        let dir = false;
        if (!existsSync(output)) {
            if (pack === false) {
                mkdirSync(output, { recursive: true });
                dir = true;
            }
        } else {
            if (statSync(output).isDirectory()) {
                if (readdirSync(output).length != 0 && force === false) {
                    throw new UsageError(`output directory:${output} is not empty, make sure and use --force to cover the content`);
                } else {
                    dir = true;
                }
            } else {
                if (pack === true) {
                    if (force === false) {
                        throw new UsageError(`output file:${output} is exists, make sure and use --force to cover the content`);
                    }
                } else {
                    throw new UsageError(`output directory:${output} is a file, make sure the path is right`);
                }
            }
        }
        return dir;
    }

    async execute() {
        const dir = this.check(this.output, this.pack, this.force);
        console.log("dir:", dir);
        console.log(this.input, this.output, this.pack, this.force);
        const project = new Project();
        project.addSourceFilesAtPaths(this.input);
        const sourceFiles = project.getSourceFiles();
        if (dir) {
            sourceFiles.forEach(sourceFile => {
                const output_interface = project.createSourceFile(
                    join(this.input, relative(__dirname, sourceFile.getFilePath())),
                    undefined,
                    { overwrite: true }
                );
                const classes = sourceFile.getClasses();
                const interfaces = classes.map(classs => classs.extractInterface());
                output_interface.addInterfaces(interfaces.map(i => {
                    return { ...i, ...{ isExported: true } }
                }));
            });
        } else {
            const output_interface = project.createSourceFile(
                this.output,
                undefined,
                { overwrite: true }
            );
            sourceFiles.forEach(sourceFile => {
                const classes = sourceFile.getClasses();
                const interfaces = classes.map(classs => classs.extractInterface());
                output_interface.addInterfaces(interfaces.map(i => {
                    return { ...i, ...{ isExported: true } }
                }));
            });
        }
        await project.save();
    }
})