$(document).ready(() => {
  const socket = io("/");
  if ($.cookie("userId")) {
    showDataFromCookie();
  } else {
    console.log("chuwa ton tai cookie");
  }

  $("#btnLuu").click(() => {
    const value = $("#api_token").val();
    if (value) {
      $("#alert").html(`Đang kiểm tra ...`);
      requestInfo(value);
    }else
    {
      showDataFromCookie();
    }
  });

  socket.on("Server-send-data", (data) => {
    $("#noidung").html("Thành công...");
    $("#taOutput").html(data);
  });

  //   socket.on("Server-send-cache", (data) => {
  //     $("#api_token").val(data.api_token);
  //     console.log(data.api_token);
  //   });

  $("#mrA").click(() => {
    const dataInput = $("#taInput").val();
    if (dataInput) {
      $("#noidung").html("Đang ấy ấy chờ xíu nhé...");
      socket.emit("Client-send-data", {
        data: dataInput,
        api_token: $.cookie("api_token"),
        userId: $.cookie("userId"),
        userName: $.cookie("userName"),
      });
    }else{
      $("#noidung").html("Chưa nhập nội dung kìa cha nội...");
    }
  });

  $("#btnCopy").click(() => {
    const dataOutput = $("#taOutput").val();
    if (dataOutput) {
      // $("#noidung").html("Đang ấy ấy chờ xíu nhé...");
      console.log("có data");
      $("#taOutput").focus();
      $("#taOutput").select();

      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        $("#noidung").html('COPY ' + msg);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      
      
    }else{
      $("#noidung").html("ủa copy cái gì thế?");

    }
  });

  function requestInfo(token) {
    $.get({
      url: "https://pub.masoffer.com/api/extension/info",
      data: {
        token: token,
      },
      success: (response) => {
        if (response.status == 200) {
          let now = new Date().toLocaleString();

          $.cookie("api_token", token);
          $.cookie("userName", response.data.user.name);
          $.cookie("userId", response.data.user.refcode);
          $.cookie("last_fetch", now);

          showDataFromCookie();
        } else {
          console.log("error1");
        }
      },
      error: () => {
        console.log("error2");
      },
    });
  }

  function showDataFromCookie() {
    $("#api_token").val($.cookie("api_token"));
    $("#alert").html(`${$.cookie("userId")} => ${$.cookie("userName")} `);
  }
});
