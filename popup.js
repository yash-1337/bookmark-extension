let bookmarkData;

$.ajax({
  url: "https://bookmark-extension.herokuapp.com/getBookmarks",
  success: function(data) {
    $("#loading").hide();
    LoadBookmarks(data);
  }
});

function LoadBookmarks(data) {
  bookmarkData = data;
  $.each(bookmarkData, function(key, value) {
    if (key != "Bookmarks" && key != "_id") {
      let title = key;
      $('.container').append("<div class='folder' id='" + title + "'><span class='folderName'>" + title + "</span><span class='folderDescription w3-badge w3-small w3-green'>" + value.length + "</span><i class='deleteFolder w3-button w3-round-large w3-hover-red fa fa-times'></i></div>");
      $('.FolderSelect').append("<option>" + title + "</option>");

      $.each(bookmarkData[key], function(index, value) {
        if (value != null) {
          $('#' + title).append("<div class='bookmark bookmarkInFolder' style='display: none'><span class='bookmarkName'>" + value.title + "</span><span class='bookmarkURL'>" + value.url + "</span><i class='deleteBookmark w3-button w3-round-large w3-hover-red fa fa-times'></i></div>");
        }
        //$('.container').append("<p>hello</p>");
      });
    }
  });

  $.each(bookmarkData.Bookmarks, function(index, value) {
    if (value != null) {
      $('.container').append("<div class='bookmark'><span class='bookmarkName'>" + value.title + "</span><span class='bookmarkURL'>" + value.url + "</span><i class='deleteBookmark w3-button w3-round-large w3-hover-red fa fa-times'></i></div>");
    }
  });

  function UpdateContainerHeight(){
    if($( ".newBookmarkBar" ).is( ":visible" )||$( ".newFolderBar" ).is( ":visible" )){
      $('.container').height(432);
    } else {
      $('.container').height(470);
    }
  }

  function UpdateButtonBar(){
    if ($(".container").prop('scrollHeight') > $(".container").height() ) {
      if($( ".newBookmarkBar" ).is( ":visible" )||$( ".newFolderBar" ).is( ":visible" )){
        $('.buttonBar').removeClass('BorderTop');
        $('.newBookmarkBar').addClass('BorderTop');
        $('.newFolderBar').addClass('BorderTop');
      }else{
        $('.buttonBar').addClass('BorderTop');
      }
    }else{
      $('.buttonBar').removeClass('BorderTop');
      $('.newBookmarkBar').removeClass('BorderTop');
      $('.newFolderBar').removeClass('BorderTop');
    }
    
  };

  UpdateButtonBar();

  $(".NewBookmark").click(function() {
    $('.newBookmarkBar').toggle();
    $('.newFolderBar').hide();
    chrome.tabs.query({
      active: true
    }, function(tab) {
      $('.WebsiteInput').val(tab[0].title);
    });

    UpdateContainerHeight();
    UpdateButtonBar();
  });
  $(".NewFolder").click(function() {
    $('.newFolderBar').toggle();
    $('.newBookmarkBar').hide();
    UpdateContainerHeight();
    UpdateButtonBar();
  });

  $('.AddFolder').click(function() {
    let folder = $('.FolderInput').val().charAt(0).toUpperCase() + $('.FolderInput').val().slice(1);

    let data = {
      folder: folder
    }
    if (folder.length > 0) {
      $.post("https://bookmark-extension.herokuapp.com/addFolder", data).done(function(data) {
        if (data.title) {
          $('.folder').last().after("<div class='folder' id='" + data.title + "'><span class='folderName'>" + data.title + "</span><span class='folderDescription w3-badge w3-small w3-green'>" + 0 + "</span><i class='deleteFolder w3-button w3-round-large w3-hover-red fa fa-times'></i></div>");
          $('.FolderSelect').append("<option>" + data.title + "</option>");
          $('.newFolderBar').hide();
          UpdateContainerHeight();
          UpdateButtonBar();
        } else {
          alert(data);
        }
      });
    }
    
  });

  $('.AddBookmark').click(function() {
    chrome.tabs.query({
      active: true
    }, function(tab) {
      let title = $('.WebsiteInput').val();
      let folder = $('.FolderSelect option:selected').text();
      let url = tab[0].url;

      let data = {
        title: title,
        folder: folder,
        url: url
      };

      if (title.length > 0) {
        $.post("https://bookmark-extension.herokuapp.com/addBookmark", data).done(function(data) {
          if (data.folder) {
            if ($('#' + data.folder).children('.bookmark').css('display') === 'none') {
              $('#' + data.folder).append("<div class='bookmark bookmarkInFolder' style='display: none'><span class='bookmarkName'>" + data.title + "</span><span class='bookmarkURL'>" + data.url + "</span><i class='deleteBookmark w3-button w3-round-large w3-hover-red fa fa-times'></i></div>");
            } else if ($('#' + data.folder).children('.bookmark').css('display') != 'none') {
              $('#' + data.folder).append("<div class='bookmark bookmarkInFolder'><span class='bookmarkName'>" + data.title + "</span><span class='bookmarkURL'>" + data.url + "</span><i class='deleteBookmark w3-button w3-round-large w3-hover-red fa fa-times'></i></div>");
            }
            $('#' + data.folder + " .folderDescription").text(data.itemsinFolder);
          } else {
            $('.container').append("<div class='bookmark'><span class='bookmarkName'>" + data.title + "</span><span class='bookmarkURL'>" + data.url + "</span><i class='deleteBookmark w3-button w3-round-large w3-hover-red fa fa-times'></i></div>");
          }
          $('.newBookmarkBar').hide();
          UpdateContainerHeight();
          UpdateButtonBar();
        });
      };
    });
  });

  $('.container').on("mouseenter", ".bookmarkURL", function() {
    let $this = $(this);
    if (this.offsetWidth < this.scrollWidth && !$this.attr('title')) {
      $this.attr('title', $this.text());
    }
  });

  $('.container').on("mouseenter", ".bookmarkURL", function() {
    let $this = $(this);
    if (this.offsetWidth < this.scrollWidth && !$this.attr('title')) {
      $this.attr('title', $this.text());
    }
  });

  $(".container").on("click", ".folder", function(e) {
    if ($(e.target).hasClass('deleteFolder')) {
      return;
      UpdateButtonBar();
    } else {
      let that = $(this);
      $(that).css('background-color', 'white');
      $(this).children('.bookmark').toggle('easing', function() {
        if ($(that).children('.bookmark').css('display') == 'block') {

          $(that).css('border-left', '5px solid #4CAF50');
          $(that).css('border-right', '6px solid #4CAF50');
          UpdateButtonBar();
        } else {
          $(that).css('border-left', '0px solid #4CAF50');
          $(that).css('border-right', '0px solid #4CAF50');
          UpdateButtonBar();
        }
      });
      
    }
  });

  $(".container").on("mouseenter", ".folder", function(e) {
    if ($(this).children('.bookmark').css('display') === 'none') {
      $(this).css('background-color', '#eee');
    }
  }).on("mouseleave", ".folder", function(e) {
    $(this).css('background-color', 'white');
  });

  $(".container").on("mouseenter", ".folderName", function() {
    $(this).parent().css("background", "#eee");
  }).on("mouseleave", ".folderName", function() {
    $(this).parent().css("background", "white");
  });

  $(".container").on("click", ".bookmark", function(e) {
    if ($(e.target).hasClass('deleteBookmark')) {
      return;
    } else {
      let url = $(this).children('.bookmarkURL').text();
      chrome.tabs.update({url: url});
      window.close();
    }
  });

  $(".container").on("click", ".deleteBookmark", function(e) {
    let title = $(this).siblings('.bookmarkName').text();
    let url = $(this).siblings('.bookmarkURL').text();
    let InFolder = $(this).parent().hasClass('bookmarkInFolder');
    let folder = $(this).parents('div[class^="folder"]').attr('id');
    let data = {
      title: title,
      url: url,
      InFolder: InFolder,
      folder: folder
    };
    let that = $(this);
    $.ajax({
      url: 'https://bookmark-extension.herokuapp.com/removeBookmark',
      type: 'DELETE',
      data: data,
      success: function(data) {
        if (data != "deleted") {
          let folder = data;
          let ItemsInFolder = that.parent().siblings('.folderDescription').text() - 1;
          that.parent().siblings('.folderDescription').text(ItemsInFolder);
        }
        that.parent().remove();
        UpdateButtonBar();
      }
    });

  });

  $(".container").on("click", ".deleteFolder", function(e) {
    let folder = $(this).parent().attr('id');
    console.log(folder);
    let data = {
      folder: folder
    }
    let that = $(this);
    $.ajax({
      url: 'https://bookmark-extension.herokuapp.com/removeFolder',
      type: 'DELETE',
      data: data,
      success: function(data) {
        that.parent().remove();
        UpdateButtonBar();
      }
    });

  });

};
