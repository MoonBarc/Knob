const readline = require('readline')
const chalk = require("chalk")
const fs = require("fs")
var verbs = ["SETDEFAULT","VERSION","LOGIN","URL"]
var currentDefault
var version
var url
var tokenpath
var username
var lines = []
function readKnobfile(path) {
    var rl = readline.createInterface({
        input: require("fs").createReadStream(path),
    })
    rl.on("line",async(line) => {
        lines.push(line)
    })
    rl.on("close",async() => {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if(!line.startsWith("#")) {
                if(line != "" && line != "\n" && line != "\r\n") {
                    var formattedLine = line
                    if(version) {
                        formattedLine = formattedLine.replace(/\$version/g,version)
                    }
                    if(currentDefault) {
                        formattedLine = formattedLine.replace(/\$default/g,currentDefault)
                    }
                    if(line.includes("$ask")) {
                        const rl = readline.createInterface(process.stdin,process.stdout)
                        await new Promise((res) => {
                            rl.question(`[Q] ${line.split(" ")[0]} (${currentDefault})> `,(a) => {
                                if(a) {
                                    formattedLine = formattedLine.replace(/\$ask/g,a)
                                }else{
                                    formattedLine = formattedLine.replace(/\$ask/g,currentDefault)
                                }
                                rl.close()
                                res()
                            })
                        })
                    }
                    var args = formattedLine.split(" ")
                    args.shift()
                    verbs.forEach((c) => {
                        if(c == line.split(" ")[0]) {
                            switch (c) {
                                case "SETDEFAULT":
                                    currentDefault = args.join(" ")
                                    break;
                                case "VERSION":
                                    version = args.join(" ")
                                    break;
                                case "URL":
                                    url = args.join(" ")
                                    break
                                case "LOGIN":
                                    username = args[0]
                                    args.shift()
                                    tokenpath = args.join(" ")
                                    break
                                default:
                                    break;
                            }
                        }
                    })
                }
            }
        }
        if(!tokenpath || !url || !username) {
            console.error(chalk.red("[FAIL]: Knobfile missing URL or correct LOGIN statement."))
        }
        // comprehend what we just heard
        tokenpath = tokenpath.replace(/~/g,require("os").homedir())
        var token = fs.readFileSync(tokenpath)
        var cp = require("child_process")
        console.log(chalk.blue(`Logging in as ${username}`))
        console.log(chalk.blue(cp.execSync(`docker login docker.pkg.github.com -u ${username} -p ${token}`).toString()))
        console.log(chalk.blue("Building..."))
        var id
        try{
        await new Promise(async(res,rej) => {
            var fin = false
            var cmd = cp.spawnSync(`docker build .`,{shell: true,cwd: process.cwd()})
            // cmd.on("message",(m => {
            //     console.log(m.toString())
            //     if(m.toString().includes("Successfully built ")) {
            //         fin = true
            //         var id = m.toString().replace("Successfully built ","")
            //         console.log(id)
            //         return res()
            //     }
            // }))
            // cmd.on("close",() => {
            //     if(!fin) {
            //         return rej()
            //     }
            // })
            console.log(url)
            await new Promise((res2,rej2) => {
                if(cmd.stdout.toString().includes("Successfully built ")) {
                    var d = cmd.stdout.toString().replace("\r\n","\n").split("\n")
                    d.forEach((ln) => {
                        if(ln.includes("Successfully built ")) {
                            id = ln.replace("Successfully built ","")
                            console.log(chalk.green("Built " + id))
                            console.log(chalk.blue("Tagging..."))
                            res()
                        }
                    })
                }else{
                    rej2(new Error("Docker build failed."))
                }
            })
        })
        }catch(e) {
            console.error("Error building!",e)
            process.exit(1)
        }
        try {
            await new Promise((res,rej) => {
                var cmd = cp.execSync(`docker tag ${id} ${url}`)
                console.log(chalk.blue("Tagged, ready to push!"))
                res()
            })
        }catch(e) {
            console.error("Error tagging!",e)
        }
        // push
        console.log(chalk.blue("Pushing, this may take a moment..."))
        try {
            await new Promise((res,rej) => {
                var cmd = cp.execSync(`docker push ${url}`)
                console.log(chalk.green("Pushed!"))
                res()
            })
        }catch(e) {
            console.error("Error pushing!",e)
        }
        console.log(chalk.green("Completed!"))
    })
}

module.exports = readKnobfile