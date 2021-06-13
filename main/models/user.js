var mongoose      =require("mongoose");
var passportLM    =require("passport-local-mongoose");

var userschema=new mongoose.Schema({
	username:String,
	password:String
});
userschema.plugin(passportLM);
module.exports=mongoose.model("user",userschema);