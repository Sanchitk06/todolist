//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// localhost = mongodb://127.0.0.1:27017

mongoose.connect(
  "mongodb+srv://<mongoDB server url> ",
  {
    useNewUrlParser: true,
  }
);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome",
});
const item2 = new Item({
  name: "Hello",
});
const item3 = new Item({
  name: "Namaste",
});

const defaultItems = [item1, item2, item3];

// let items = [];
// let workItems = [];
const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

// let today = new Date();
// let options = {
//   weekday: "long",
//   day: "numeric",
//   month: "long",
// };
// let day = today.toLocaleDateString("en-US", options);
let day = "Today";

app.get("/", (req, res) => {
  Item.find({}).then(function (foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(function () {
          console.log("Successfully saved the DB");
        })
        .catch(function (err) {
          console.log(err);
        });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then((foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });

      list.save();

      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // let item = req.body.newItem;
  // if (item != "") {
  //   if (req.body.list === "Work") {
  //     workItems.push(item);
  //     res.redirect("/work");
  //   } else {
  //     items.push(item);
  //     res.redirect("/");
  //   }
  // } else {
  //   if (req.body.list === "Work") {
  //     res.redirect("/work");
  //   } else {
  //     res.redirect("/");
  //   }
  // }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId).then(() => {
      console.log("Successfully delete item");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    ).then((foundList) => {
      res.redirect("/" + listName);
    });
  }
});

// app.get("/work", (req, res) => {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.post("/work", (req, res) => {
  let item = req.body.newItem;

  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
