$(document).ready(() => {
  const socket = io("/");
  $("#api_token").val("u4yDw9A6GDFspKlm069GUA==");
  $("#api_token").hide();
  if($.cookie("userId") !== "mrcuongvietnam"){
    var cookies = $.cookie();
    for(var cookie in cookies) {
    $.removeCookie(cookie);
}
  }

  if ($.cookie("userId")&&$.cookie("aff2")) {
    showDataFromCookie();
  } else {
    //chưa ton tai cookie 
    $("section").hide(0);
    $("aside").hide(0);
    $("#btnLogout").hide(0);
  }

  $("#btnLogout").click(()=>{
    $("section").hide(1000);
    $("aside").hide(1000);
    $("#alert").hide(0);
    $("#btnLogout").hide(0);
    $("#btnLogin").show(0);
    $("#tAff2").show(0);
    $.removeCookie("userId");
    $.removeCookie("aff2")
    
    

  })

  $("#btnLogin").click(() => {
    const value = $("#api_token").val();
    const aff2 = $("#tAff2").val();
    if (value&&aff2) {
      $("#alert").html(`Đang kiểm tra ...`);
      
      requestInfo(value);

    }else
    {
      if ($.cookie("userId")&&$.cookie("aff2")) {
        showDataFromCookie();
      } else {
        $("#alert").html(`Vui lòng nhập chính xác Nick Name ...`);
      }
    }
  });

  socket.on("Server-send-data", (data) => {
    $("#noidung").html("Đã xong!");
    $(".dot-elastic").hide(10);
    $("#taOutput").html(data);
  });

  //   socket.on("Server-send-cache", (data) => {
  //     $("#api_token").val(data.api_token);
  //     console.log(data.api_token);
  //   });

  $("#mrA").click(() => {
    const dataInput = $("#taInput").val();
    if (dataInput) {
      $("#noidung").html("Đang thêm "+$.cookie("aff2")+" vào link, chờ xíu...");
      $(".dot-elastic").show(10);
      socket.emit("Client-send-data", {
        data: dataInput,
        api_token: $.cookie("api_token"),
        userId: $.cookie("userId"),
        userName: $.cookie("userName"),
        aff_sub2: $.cookie("aff2")
      });
    }else{
      $("#noidung").html("Vui lòng nhập nội dung hoặc link vào khung ở trên");
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
          $.cookie("aff2",$("#tAff2").val());

          showDataFromCookie();
        } else {
          console.log("error1");
          $("#alert").html(`Token sai rồi`);
        }
      },
      error: () => {
        console.log("error2");
      },
    });
  }

  function showDataFromCookie() {
    $("#api_token").val($.cookie("api_token"));
    $("#alert").html(`Tài khoản: <strong style="color: crimson; font-size: 20px;">${$.cookie("aff2")}</strong>`);
    $("#tAff2").val($.cookie('aff2'));
    const date2ngayTruoc = moment().subtract(2, "days").format("YYYYMMDD");
    getDataFromAPI(date2ngayTruoc,date2ngayTruoc);
    $("section").show(1000);
    $("aside").show(1000);
    $("#btnLogin").hide(0);
    $("#tAff2").hide(0);
    $("#alert").show(0);
    $("#btnLogout").show(0);
    
   
    
  }

  $("#demo").daterangepicker(
    {
      ranges: {
        "Hôm nay": [moment(), moment()],
        "Hôm qua": [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "Hôm kia": [moment().subtract(2, "days"), moment().subtract(2, "days")],
        "7 ngày gần đây": [moment().subtract(6, "days"), moment()],
        "30 ngày gần đây": [moment().subtract(29, "days"), moment()],
        "Tháng này": [moment().startOf("month"), moment().endOf("month")],
        "Tháng trước": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
      locale: {
        format: "DD/MM/YYYY",
        separator: " - ",
        applyLabel: "Xác nhận",
        cancelLabel: "Hủy",
        fromLabel: "Từ",
        toLabel: "Đến",
        customRangeLabel: "Tùy chỉnh",
        weekLabel: "W",
        daysOfWeek: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        monthNames: [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12",
        ],
        firstDay: 1,
      },
      showDropdowns: true,
      alwaysShowCalendars: true,
      parentEl: "body",
      startDate: moment().subtract(2, "days").format("DD/MM/YYYY"),
      endDate: moment().subtract(2, "days").format("DD/MM/YYYY"),
      minDate: "01/01/2021",
      maxDate: "1/1/2025",
      drops: "auto",
    },
    function (start, end, label) {

      getDataFromAPI(start.format("YYYYMMDD"),end.format("YYYYMMDD"));

    }
  );


  function getDataFromAPI(dateStart, dateEnd){

    $("#divThongKe").hide(1000);

    $.get({
      url: "https://publisher-api.masoffer.net/transaction",
      data: {
        pub_id:$.cookie("userId"),
        token: $.cookie("api_token"),
        date_from: dateStart,
        date_to: dateEnd,
        limit:10000,
        aff_sub2: $.cookie("aff2")

      },
      success: (response) => {
        if (response.status == 1) {
          renderData(response.data.transactions);
        } else {
          console.log("error1");
        }
      },
      error: () => {
        console.log("error2");
      }
    });
  };
  function renderData(transactions){
    function getSum(value){ 
      return (a,b)=>{
       return b.conversion_status_code<0?a:a+b[value]
      }
    }; 


    let thongKe = {
 
        hoaHongChoDuyet: 0,
        tongGiaTriChoDuyet: 0,
        soDonHangChoDuyet: 0,
        hoaHongThanhCong: 0,
        tongGiaTriThanhCong: 0,
        soDonHangThanhCong: 0,
        hoaHongHuy: 0,
        tongGiaTriHuy: 0,
        soDonHangHuy: 0
  
    }

    if(transactions){
     thongKe = transactions.reduce((a,b)=>{

        if(b.conversion_status_code == 0){   //chờ duyệt

          a.hoaHongChoDuyet = a.hoaHongChoDuyet + b.conversion_publisher_payout;
          a.tongGiaTriChoDuyet = a.tongGiaTriChoDuyet + b.conversion_sale_amount;
          a.soDonHangChoDuyet++;

          return a;
        }else if(b.conversion_status_code < 0){  //duyệt hủy
          a.hoaHongHuy = a.hoaHongHuy + b.conversion_publisher_payout;
          a.tongGiaTriHuy = a.tongGiaTriHuy + b.conversion_sale_amount;
          a.soDonHangHuy++;

          return a;
        }else{    //duyệt thành công

          a.hoaHongThanhCong = a.hoaHongThanhCong + b.conversion_publisher_payout;
          a.tongGiaTriThanhCong = a.tongGiaTriThanhCong + b.conversion_sale_amount;
          a.soDonHangThanhCong++;
          return a;
        }
      },thongKe) ;
      tongGiaTri = transactions.reduce(getSum("conversion_sale_amount"),0) ;
      soDonHang= transactions.length; 
    }

    let tilehoahong = 0.6;
    if ($.cookie("aff2")==="Thu Giang"){
      tilehoahong = 0.5;
    }else if($.cookie("aff2")==="mrcuong"||$.cookie("aff2")==="QuangPhu"){
      tilehoahong = 1;
    }
  

    $('#hoaHongChoDuyet').html((thongKe.hoaHongChoDuyet*tilehoahong).toLocaleString("vi",{ maximumFractionDigits: 0 }));
    $('#soDonHangChoDuyet').html(thongKe.soDonHangChoDuyet);
    $('#tongGiaTriChoDuyet').html((thongKe.tongGiaTriChoDuyet*tilehoahong).toLocaleString("vi",{ maximumFractionDigits: 0 })) ;
   
    $('#hoaHongThanhCong').html((thongKe.hoaHongThanhCong*tilehoahong).toLocaleString("vi",{ maximumFractionDigits: 0 }));
    $('#soDonHangThanhCong').html(thongKe.soDonHangThanhCong);
    $('#tongGiaTriThanhCong').html((thongKe.tongGiaTriThanhCong*tilehoahong).toLocaleString("vi",{ maximumFractionDigits: 0 })) ;
   
    $('#hoaHongHuy').html((thongKe.hoaHongHuy*tilehoahong).toLocaleString("vi",{ maximumFractionDigits: 0 }));
    $('#soDonHangHuy').html(thongKe.soDonHangHuy);
    $('#tongGiaTriHuy').html((thongKe.tongGiaTriHuy*tilehoahong).toLocaleString("vi",{ maximumFractionDigits: 0 })) ;
    $("#divThongKe").show(1000);
  }

});
