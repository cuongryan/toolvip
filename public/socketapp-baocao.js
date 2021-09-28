$(document).ready(() => {
  const socket = io("/");

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
      startDate: "01/09/2021",
      endDate: "28/09/2021",
      minDate: "01/01/2021",
      maxDate: "1/1/2023",
      drops: "auto",
    },
    function (start, end, label) {

      getDataFromAPI(start.format("YYYYMMDD"),end.format("YYYYMMDD"));

    }
  );


  function getDataFromAPI(dateStart, dateEnd){
    $.get({
      url: "https://publisher-api.masoffer.net/transaction",
      data: {
        pub_id:"mrcuongvietnam",
        token: "u4yDw9A6GDFspKlm069GUA==",
        date_from: dateStart,
        date_to: dateEnd

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

    
  

    console.log(`Hoa hồng chờ duyệt: ${thongKe.hoaHongChoDuyet}  So don hang: ${thongKe.soDonHangChoDuyet} Tong gia tri: ${thongKe.tongGiaTriChoDuyet}`);
    console.log(`Hoa hồng thành công: ${thongKe.hoaHongThanhCong}  So don hang: ${thongKe.soDonHangThanhCong} Tong gia tri: ${thongKe.tongGiaTriThanhCong}`);
    console.log(`Hoa hồng hủy: ${thongKe.hoaHongHuy}  So don hang: ${thongKe.soDonHangHuy} Tong gia tri: ${thongKe.tongGiaTriHuy}`);
    
  }

});
