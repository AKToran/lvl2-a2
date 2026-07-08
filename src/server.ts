import app from "./app";
const port = 5000;

const main = () => {
  app.listen(port,()=>{
    console.log('App is listening...!');
  })
}

main();