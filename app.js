import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import request from "sync-request";
import cache from "memory-cache";

//variable
const port = process.env.PORT || 3100;

//init
const app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.get("/", (req, res) => {
  res.render("trangchu");
});


const server = createServer(app);
const io = new Server(server, {});
server.listen(port);

//socket
io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  // cacheInit(socket);

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });

  socket.on("Client-send-data", (data) => {
    socket.emit("Server-send-data", changeContent(data));
  });
});

function changeContent(data) {
  

  let offers;
  try {
    offers = cache.get(data.api_token + "_offers");
  } catch {
    console.log("error cache Cache offers!!!");
  }

  if (!offers) {
    try {
      offers = JSON.parse(
        request("POST", "https://pub.masoffer.com/api/extension/info", {
          headers: {
            "Content-Type": "application/json",
          },
          json: { token: data.api_token },
        }).getBody()
      ).data.offers;

      offers = cache.put(data.api_token + "_offers", offers);
    } catch (error) {
      return "Token error: F5 đi nè!" + error;
    }
  }

  
  const dateTime = new Date();
  const dateNow = (dateTime.getFullYear()-2000).toString() 
  + "-" + (dateTime.getMonth() + 1).toString().padStart(2,'0') 
  + "-" + (dateTime.getDate()).toString().padStart(2,'0')
  + ":" + (dateTime.getHours()).toString().padStart(2,"0");
 
  const exp = /(https?:\/\/[^\s]+)/g;

  let dataOutput = data.data.replace(exp, (e) => {
    let cacheFinishUrl;
    try {
      cacheFinishUrl = cache.get(
        data.api_token + data.aff_sub2 + data.data.split(" ").slice(0, 3).join("_") + e
      );
    } catch {
      console.log("error cache fullUrlFinish!!!");
    }
    if (cacheFinishUrl) {
      return cacheFinishUrl;
    }

    let oldUrl;
  
    try {
      oldUrl = cache.get(e);
    } catch {
      console.log("error cache!!!");
    }

    if (!oldUrl) {
      try {
        oldUrl = new URL(request("GET", e).url);
        cache.put(e, oldUrl);
      } catch (error) {
        return "ERROR_Link_Died_OR_404 => " + e;
      }
    }

    let hostname = oldUrl.hostname.split(".");
    let nameHost = hostname[hostname.length - 2];

    const offersOfUrls = offers.filter((offer) =>
      offer.domain.includes(nameHost)
    );
    let bestOffersOfUrl;
    if (offersOfUrls.length != 0) {
      bestOffersOfUrl = offersOfUrls[offersOfUrls.length - 1].offer_id;
    } else {
      return "DOMAIN_NAY_CHUA_DUOC_DANG_KY" + oldUrl.hostname;
    }

    let linkData = {
      publisher_id: data.userId,
      domain: "rutgon.me",
      offer_type: "cps",
      params: {
        offer_id: bestOffersOfUrl,
        url: oldUrl.origin + oldUrl.pathname + oldUrl.search, //"https://shopee.vn/product/329422701/9905688095?af_click_lookback=7d&af_reengagement_window=7d&af_siteid=an_17194710000&af_sub_siteid=614eaadf9cbab90043a2df8f----eXQ_NSw1r9etBVSM_kSAVQ&af_viewthrough_lookback=1d&c=-&d_id=34b8d&is_retargeting=true&pid=affiliates&smtt=0.12008485-1629892077.9&utm_campaign=-&utm_content=614eaadf9cbab90043a2df8f----eXQ_NSw1r9etBVSM_kSAVQ&utm_medium=affiliates&utm_source=an_17194710000",
        aff_sub1: "toolVip",
        aff_sub2: data.aff_sub2,
        aff_sub3: "",
        aff_sub4: dateNow + " " + data.data.slice(0, 30),
      },
    };

    const options = {
      headers: {
        Authorization: data.api_token,
        "Content-Type": "application/json",
      },
      json: linkData,
    };

    try {
      const returnData = JSON.parse(
        request(
          "POST",
          "https://pub.masoffer.com/api/extension/generate-link",
          options
        ).getBody()
      );
      //const newUrl = returnData.data.short_url;
      //const newUrl = "https://sanma.vn/a/"+returnData.data.path_url.slice(2);
      let newUrl="";
      if(data.aff_sub2==="SpamThanhBinh"||data.aff_sub2==="Spam"){
         newUrl = "https://gox.li/"+returnData.data.path_url.slice(2);
      }else{
         newUrl = "https://rutgon.me/mo"+returnData.data.path_url.slice(2);
      }
      

      cache.put(
        data.api_token + data.aff_sub2 + data.data.split(" ").slice(0, 3).join("_") + e,
        newUrl
      );

      return newUrl;
    } catch (error) {
      return "ERROR_Link_chua_chuyen: " + e;
    }
  });

  return dataOutput;
}
