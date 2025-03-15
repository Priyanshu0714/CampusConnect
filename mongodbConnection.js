const mongoose=require("mongoose")

async function connection(){
    mongoose.connect('mongodb+srv://priyanshu:Ppriyanshu%401407@priyanshucluster.kzr7x.mongodb.net/CampusConnect?retryWrites=true&w=majority&appName=PriyanshuCluster', { useNewUrlParser: true, useUnifiedTopology: true,serverSelectionTimeoutMS: 20000,})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
}
module.exports=connection;