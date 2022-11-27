const { urlencoded } = require("express");
const express = require("express");
const expresslayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const ContactModel = require("./model/contact");

const app = express();
const port = process.env.PORT || 3000;
app.use(morgan("dev"));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.use(expresslayouts);
app.use(express.static("public"));
app.use(urlencoded({ extended: true }));

app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", async (req, res) => {
  const siswa = await ContactModel.find();
  // const siswa = [{
  //   nama: "Rizky",
  //   email: "rizki@gmail.com",
  //   nohp: "08123456789",
  // }];
  res.render("index", {
    layout: "layouts/main-layout",
    nama: "noels ",
    title: "index",
    siswa,
  });
});

app.get("/about", (req, res) => {
  res.render("about", { layout: "layouts/main-layout", title: "about" });
});

app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout",
    title: "Form Tambah Data",
  });
});
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await ContactModel.findOne({ nama: value });
      if (duplikat) {
        throw new Error("nama Contact suda digunakan");
      }
      return true;
    }),
    check("email", "Email Tidak Valid").isEmail(),
    check("noHp", "noHp Tidak Valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      ContactModel.insertMany(req.body, (error, result) => {
        req.flash("msg", "Data Contact Berhasil ditambahkan");
        res.redirect("/contact");
      });
    }
  }
);

app.delete("/contact", (req, res) => {
  ContactModel.deleteOne({ _id: req.body.id }).then((result) => {
    req.flash("msg", "Data Contact Berhasil Dihapus");
    res.redirect("/contact");
  });
});

app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await ContactModel.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    layout: "layouts/main-layout",
    title: "Form Edit Data",
    contact,
  });
});

app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await ContactModel.findOne({ nama: value });
      if (value !== req.body.namaLama && duplikat) {
        throw new Error("nama Contact suda digunakan");
      }
      return true;
    }),
    check("email", "Email Tidak Valid").isEmail(),
    check("noHp", "noHp Tidak Valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Tambah Data",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      ContactModel.updateOne(
        { _id: req.body.id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            noHp: req.body.noHp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data Contact Berhasil diubah");
        res.redirect("/contact");
      });
    }
  }
);

app.get("/contact", async (req, res) => {
  const Contacts = await ContactModel.find();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "contact",
    Contacts,
    msg: req.flash("msg"),
  });
});

app.get("/contact/:nama", async (req, res) => {
  const Contact = await ContactModel.findOne({ nama: req.params.nama });
  res.render("details", {
    layout: "layouts/main-layout",
    title: "Detail Contact",
    Contact,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});

//! this is security test

// app.post(
//   "/contact/update",
//   [
//     body("nama").custom((value,{req}) => {
//       const duplikat = cekDuplikat(value);
//       if (value !== req.body.namaLama && duplikat) {
//         throw new Error("nama Contact suda digunakan");
//       }
//       return true;
//     }),
//     check("email", "Email Tidak Valid").isEmail(),
//     check("noHp", "noHp Tidak Valid").isMobilePhone("id-ID"),
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.render("edit-contact", {
//         title: "Form Tambah Data",
//         layout: "layouts/main-layout",
//         errors: errors.array(),
//         contact: req.body
//       });
//     } else {
//       UpdateContacts(req.body);
//       req.flash("msg", "Data Contact Berhasil diubah");
//       res.redirect("/contact");
//     }
//   }
// );

//! Delete without method override
// app.get("/contact/delete/:nama", async (req, res) => {
//   const contact = await ContactModel.findOne({nama: req.params.nama});
//   if (!contact) {
//     res.status(404);
//     res.send("404");
//   } else {
//     ContactModel.deleteOne({ _id:contact._id }).then((result) => {
//       req.flash("msg", "Data Contact Berhasil Dihapus");
//       res.redirect("/contact/");
//     });
//   }
// });
