///jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const port = 3000;

// const { MongoClient, ServerApiVersion } = require("mongodb");

const DB =
  "mongodb+srv://parth:parth123@cluster0.zj1fto2.mongodb.net/TodoListDB?retryWrites=true&w=majority";

mongoose.connect(DB, {
  useNewUrlParser: true,
  // useCreateIndex:true,
  // useUnifiedTopology: true,
  // useFindAndModify: false
});
// .then(() => {
//   console.log("connection successful");
// })
// .catch((err) => console.log("No connection"));

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to TodoList",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

const util = require("util");
const { log } = require("console");

app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({});

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", {
        ListTitle: "Today",
        newListItems: foundItems,
      });
    }
  } catch (err) {
    // Handle any errors that occur during the process
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/:customListName", async function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  const foundlist = await List.findOne({ name: customListName });

  if (!foundlist) {
    const list = new List({
      name: customListName,
      items: defaultItems,
    });

    await list.save();
    res.redirect("/" + customListName);
  } else {
    res.render("list", {
      ListTitle: foundlist.name,
      newListItems: foundlist.items,
    });
  }
});

app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    await item.save();
    res.redirect("/");
  } else {
    const currList = await List.findOne({ name: listName });

    currList.items.push(item);
    await currList.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    );
    res.redirect("/" + listName);
  }
});


app.get("/work", function (req, res) {
  res.render("list", {
    ListTitle: "Work List",
    newListItems: workItems,
  });
});

app.post("/work", function (req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000, function () {
  console.log("Server Started on Port 3000");
});
