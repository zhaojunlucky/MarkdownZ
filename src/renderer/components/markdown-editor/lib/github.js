const github = require('octonode');

export default class GitHub{
    constructor(){
    }

    getRepo(ghToken){
        return `${ghToken.user}/${ghToken.user}.github.io`;
    }

    checkFileExists(ghToken, filename){
        return new Promise(function(resolve, reject){
            const ghrepo = github.client().repo(this.getRepo(ghToken));
            ghrepo.contents(filename, function (err, status, body, headers) {
                if(err){
                  if(err.statusCode == 404){
                    resolve(false);
                  } else {
                    reject(err);
                  }
                }else{
                    resolve(true, status);
                }
            });
        });
    }

    processResult(resolve, reject, err, status, body, header, name){
        if(err) {
            reject(err);
        } else {
            resolve(status);
        }
    }

    createFile(ghrepo, path, filename, content){
        let that = this;
        return new Promise(function(resolve, reject){
            ghrepo.createContents(`${path}/${filename}`, `create ${filename}`, content, function (err, status, body, headers){
                  that.processResult(resolve, reject, err, status, body, headers, name);
                }); //path
        });
    }

    updateFile(ghrepo, path, filename, sha, content){
        let that = this;
        return new Promise(function(resolve, reject){
            ghrepo.updateContents(`${path}/${filename}`, `update ${filename}`, content, sha, function (err, status, body, headers){
                that.processResult(resolve, reject, err, status, body, headers, name);
              }); 
        });
    }

    statusCallback(scb, message){
        if(scb){
            scb(message);
        }
    }

    saveFile(ghToken, path, filename, content, scb){
        const ghrepo = github.client(ghToken.token).repo(this.getRepo(ghToken));
        let that = this;
        let fullPath = `${path}/${filename}`;
        return new Promise(function(resolve, reject){
            that.statusCallback(`checking file ${fullPath} exists`);
            this.checkFileExists(ghToken, fullPath).then(function(result, body){
                if(result){
                    // update
                    that.statusCallback(`updating file ${fullPath}`);
                    that.updateFile(ghrepo, path, filename, body.sha, content).then(function(r){
                        resolve(r);
                    }).catch(function(error){
                        reject(error);
                    });
                } else{
                    // create
                    that.statusCallback(`creating file ${fullPath}`);
                    that.createFile(ghrepo, path, filename, content).then(function(r){
                        resolve(r);
                    }).catch(function(error){
                        reject(error);
                    });
                }
            }).catch(function(error){
                reject(error);
            });
        });
        
    }

    renameFile(ghToken, oldPath, oldName, newPath, newName){
        const ghrepo = github.client(ghToken.token).repo(this.getRepo(ghToken));
        let that = this;
        return new Promise(function(resolve, reject){
            let oldFile = `${oldPath}/${oldName}`;
            this.checkFileExists(ghToken, oldFile).then(function(result, body){
                if(result){
                    ghrepo.deleteContents(oldFile, `delete ${oldName}`, body.sha, function(err, status, body, headers){
                        if(err){
                            reject(err);
                        }
                    }); //path
                    let b = new Buffer(body.content, 'base64');
                    that.saveFile(ghToken, newPath, newName, b.toString()).then(function(r){
                        resolve(r);
                    }).catch(function(err){
                        reject(err);
                    });
                }
            }).catch(function(err){
                reject(err);
            });
        });
    }
}