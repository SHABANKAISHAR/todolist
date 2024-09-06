//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemsSchema={
  name:String
};
const Item = mongoose.model("Item", itemsSchema);
let defaultItems;
const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

// My function
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://shabaankaishar:Shab97086@cluster0.elevj.mongodb.net/todolistDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  
  
  const item1 = new Item({
    name: "Welcome to your todolist!"
  });
  
  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });
  
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });
  
  defaultItems = [item1, item2, item3];
 
  
}






app.get("/", async function(req, res) {
   
   const foundItems=await Item.find({});
   if(foundItems.length===0){
    await Item.insertMany(defaultItems);
    res.redirect("/");
   }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
   }
});

app.get("/:customListName", async function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  const foundList=await List.findOne({name:customListName});
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        await list.save();
        res.redirect("/"+customListName);
    }
    else{
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
    
});

app.post("/", async function(req, res){

  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName 
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
   }
    else{
      const foundList=await List.findOne({name:listName})  
      foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      
    }
}); 

app.post("/delete",async function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
  await Item.findByIdAndDelete(checkedItemId);
  console.log("Successfully saved default items to DB");
  res.redirect("/");
  }else{
   await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
   res.redirect("/"+listName);
     
  }
});

  

app.get("/about", function(req, res){
  res.render("about");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
