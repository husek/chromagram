import express from "express";
import path from "path";
import expressValidator from "express-validator";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import * as chromagramController  from "./controllers/chromagram";

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true, parameterLimit: 1000000 }));
app.use(expressValidator());
app.use(fileUpload());
app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

app.post("/chromagram", chromagramController.getChromagram);


app.listen(app.get("port"), () => {
    console.log(
        "  App is running at port:%d",
        app.get("port")
    );
});