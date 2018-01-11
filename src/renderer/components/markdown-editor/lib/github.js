const github = require('octonode');

export default class GitHub{
    constructor(){
        console.log('github')
    }

    getRepo(ghToken){
        return `${ghToken.user}/${ghToken.user}.github.io`;
    }

    checkFileExists(ghToken, filename){
        let that = this;
        return new Promise(function(resolve, reject){
            const ghrepo = github.client().repo(that.getRepo(ghToken));
            ghrepo.contents(filename, function (err, status, body, headers) {
                if(err){
                  if(err.statusCode == 404){
                    resolve({
                        result: false
                    });
                  } else {
                    reject(err);
                  }
                }else{
                    resolve({
                        result: true,
                        body: status,
                    });
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
            that.statusCallback(scb, `checking file ${fullPath} exists`);
            that.checkFileExists(ghToken, fullPath).then(function(result){
                if(result.result){
                    // update
                    that.statusCallback(scb, `updating file ${fullPath}`);
                    that.updateFile(ghrepo, path, filename, result.body.sha, content).then(function(r){
                        resolve(r);
                    }).catch(function(error){
                        reject(error);
                    });
                } else{
                    // create
                    that.statusCallback(scb, `creating file ${fullPath}`);
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

    renameFile(ghToken, oldPath, oldName, newPath, newName, newContent){
        const ghrepo = github.client(ghToken.token).repo(this.getRepo(ghToken));
        let that = this;
        return new Promise(function(resolve, reject){
            let oldFile = `${oldPath}/${oldName}`;
            that.checkFileExists(ghToken, oldFile).then(function(result){
                if(result.result){
                    ghrepo.deleteContents(oldFile, `delete ${oldName}`, result.body.sha, function(err, status, body, headers){
                        if(err){
                            reject(err);
                        }
                    }); //path
                    that.saveFile(ghToken, newPath, newName, newContent).then(function(r){
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