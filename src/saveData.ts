const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
  userDataPath = (electron.app || electron.remote.app).getPath('userData');
  path: string = path.join(this.userDataPath, "contacts" + '.txt');;
  data: string;

  constructor(data?:string) {
    this.data = data || "";
  }

  getContacts(): string {
    try {
      return fs.readFileSync(this.path, {encoding: "utf8"});
    } catch(error) {
      return "";
    }
  }
  clearData(){
    try{
      fs.unlinkSync(this.path)
    }catch(e){
      
    }
  }


  save(){
    fs.writeFileSync(this.path, this.data);
  }
}

module.exports = Store;
