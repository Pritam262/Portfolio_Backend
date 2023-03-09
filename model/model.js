const mongoose = require("mongoose")

const model = new mongoose.Schema({
    Picture:{
        type:String,
    },
    Path:{
        type:String

    },
    Folder:{
        type:String
    },
    folderPath:{
        type:String

    },
    title:{
        type:String

    },
    desc:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model("work", model)