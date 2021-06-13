var express           =require("express");
var app               =express();
var passport          =require("passport");
var local             =require("passport-local");
var user              =require("./models/user");
var passportLM        =require("passport-local-mongoose");
var methodoverride    =require("method-override");
var expresssanitizer  =require("express-sanitizer");
var bodyparser        =require("body-parser");
const mongoose        =require('mongoose');

//  clg_guide App congiguration
app.use(express.static("public"));
app.use(require("express-session")({
	secret: "college guide is thope",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyparser.urlencoded({extended:true}));
app.use(expresssanitizer());
app.use(methodoverride("_method"));
passport.use(new local(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
mongoose.connect('mongodb://localhost:27017/clg_guide', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

//mongoose model configuration
var guideSchema = new mongoose.Schema({
	rno:{type:String, default: "none"},
	dept:{type:String, default: "none"},
	faculty: {type:String, default: "classroom"},
	image:{type:String, default: "none"},
	body:{type:String, default: "none"},
	created: {type: Date, default: Date.now}
});
var guide=mongoose.model("guide",guideSchema);

app.get("/register",function(req,res){
	res.render("register.ejs");
})
app.post("/register",function(req,res){
	req.body.username
	req.body.password
	user.register(new user({username:req.body.username}),req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("register.ejs");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/home");
		});
	});
});
app.get("/",function(req,res){
	res.render("rlogin.ejs");
})
app.post("/",passport.authenticate("local",{
	successRedirect:"/home",
	failureRedirect:"/"
	}),function(req,res){
	res.render("rlogin.ejs");
})
app.get("/home/logout",function(req,res){
	req.logout();
	res.redirect("/");
})
app.get("/home/about",function(req,res){
	res.render("aboutt.ejs");
});
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/");
}
app.get("/home/guides",isLoggedIn,function(req,res){
	guide.find({},function(err,guides){
		if(err){
			console.log("Error !")
		}
		else{
			res.render("index.ejs",{guides:guides});
		}
	})
})
app.get("/home/guides/new",function(req,res){
	res.render("new.ejs");
})
app.post("/home/guides",function(req,res){
	req.body.guide.body=req.sanitize(req.body.guide.body);
	guide.create(req.body.guide,function(err,newguide){
		if(err){
			res.render("new.ejs");
		}else{
			res.redirect("/home/guides");
		}
	})
})
app.get("/home/guides/:id",function(req,res){
	guide.findById(req.params.id,function(err,found){
		if(err){
			res.redirect("/home/guides");
		}
		else{
			res.render("show.ejs",{guide:found});
		}
	})
})
app.get("/home/guides/:id/edit",function(req,res){
	guide.findById(req.params.id,function(err,found){
		if(err){
			res.redirect("/home/guides");
		} else{
			res.render("edit.ejs",{guide:found});
		}
	})
})
app.put("/home/guides/:id",function(req,res){
	req.body.guide.body=req.sanitize(req.body.guide.body);
	guide.findByIdAndUpdate(req.params.id,req.body.guide,function(err,update){
		if(err){
			res.redirect("/home/guides");
		} else {
			res.redirect("/home/guides/"+req.params.id);
		}
	})
})
app.delete("/home/guides/:id",function(req,res){
	guide.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/home/guides");
		}	else{
			res.redirect("/home/guides");
		}
	})
})

app.get("/home",function(req,res){
	res.render("home.ejs");
});
app.get("/home/sac",function(req,res){
	res.render("sac.ejs");
})
app.get("/home/manage",function(req,res){
	res.render("manage.ejs");
})
app.get("/home/sports",function(req,res){
	res.render("sports.ejs");
})

app.listen(3000,function(){
	console.log("the server is opened at port 3000");
})