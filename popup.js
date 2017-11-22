let bookmarkData;

$.ajax({
  url: "https://bookmark-extension.herokuapp.com/getBookmarks",
  async: true,
  success: function(data) {
    LoadBookmarks(data);
  }
});

function LoadBookmarks(data) {
  bookmarkData = data;
  $.each(bookmarkData, function(key, value) {
    if (key != "Bookmarks" && key != "_id") {
      let title = key;
      $('.container').append("<div class='folder' id='" + title + "'><span class='folderName'>" + title + "</span><span class='folderDescription w3-badge w3-small w3-green'>" + value.length + "</span></div>");
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

  $(".NewBookmark").click(function() {
    $('.newBookmarkBar').toggle();
    $('.newFolderBar').hide();
    chrome.tabs.getSelected(null, function(tab) {
      $('.WebsiteInput').val(tab.title);
    });
  });
  $(".NewFolder").click(function() {
    $('.newFolderBar').toggle();
    $('.newBookmarkBar').hide();
  });

  $('.AddFolder').click(function() {
    let folder = $('.FolderInput').val().charAt(0).toUpperCase() + $('.FolderInput').val().slice(1);

    let data = {
      folder: folder
    }
    if (folder.length > 0) {
      $.post("https://bookmark-extension.herokuapp.com/addFolder", data).done(function(data) {
        if (data.title) {
          $('.folder').last().after("<div class='folder' id='" + data.title + "'><span class='folderName'>" + data.title + "</span><span class='folderDescription w3-badge w3-small w3-green'>" + 0 + "</span></div>");
          $('.FolderSelect').append("<option>" + data.title + "</option>");
          $('.newFolderBar').hide();
        } else {
          alert(data);
        }
      });
    }
  });

  $('.AddBookmark').click(function() {
    chrome.tabs.getSelected(null, function(tab) {
      let title = $('.WebsiteInput').val();
      let folder = $('.FolderSelect option:selected').text();
      let url = tab.url;

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
    let that = $(this);
    $(that).css('background-color', 'white');
    $(this).children('.bookmark').toggle('easing', function() {
      if ($(that).children('.bookmark').css('display') == 'block') {

        $(that).css('border-left', '5px solid #4CAF50');
        $(that).css('border-right', '6px solid #4CAF50');
      } else {
        $(that).css('border-left', '0px solid #4CAF50');
        $(that).css('border-right', '0px solid #4CAF50');
      }
    });

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

  $(".container").on("click", ".bookmark", function() {
    let url = $(this).children('.bookmarkURL').text();
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
    }
    chrome.tabs.update({url: url});
    window.close();
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

      }
    });

  });

};
