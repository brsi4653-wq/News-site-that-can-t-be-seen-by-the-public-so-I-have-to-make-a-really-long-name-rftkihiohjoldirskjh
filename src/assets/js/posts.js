// Shows a creator's posts. Used by their page and by their admin page.
// Post text is always added as plain text, with web links made clickable.
var mayhemPosts = (function () {
  var when = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" });

  function fill(el, text) {
    text.split(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g).forEach(function (part, i) {
      if (i % 2) {
        var link = document.createElement("a");
        link.href = part;
        link.rel = "noopener nofollow";
        link.textContent = part.replace(/^https?:\/\//, "");
        el.append(link);
      } else if (part) {
        el.append(part);
      }
    });
  }

  // onDelete is optional. When given, each post gets a Delete button.
  function show(box, onDelete) {
    var list = box.querySelector("[data-posts-list]");
    var message = box.querySelector("[data-posts-message]");
    var avatar = box.getAttribute("data-avatar");
    return fetch("/api/posts?creator=" + encodeURIComponent(box.getAttribute("data-posts")))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var posts = data.posts || [];
        list.textContent = "";
        message.textContent = posts.length ? "" : "No posts yet.";
        message.hidden = posts.length > 0;
        posts.forEach(function (post) {
          var item = document.createElement("li");
          item.className = "post";
          var pic = document.createElement("div");
          pic.className = "post__avatar";
          if (avatar) { var img = new Image(); img.src = avatar; img.alt = ""; pic.append(img); }
          var main = document.createElement("div");
          main.className = "post__main";
          var head = document.createElement("p");
          head.className = "post__head";
          var name = document.createElement("span");
          name.className = "post__name";
          name.textContent = box.getAttribute("data-name");
          var handle = document.createElement("span");
          handle.textContent = box.getAttribute("data-handle");
          var time = document.createElement("time");
          time.dateTime = post.created_at;
          time.textContent = when.format(new Date(post.created_at));
          head.append(name, handle, time);
          var body = document.createElement("p");
          body.className = "post__body";
          fill(body, post.body);
          main.append(head, body);
          if (onDelete) {
            var del = document.createElement("button");
            del.className = "share__btn";
            del.type = "button";
            del.textContent = "Delete";
            del.addEventListener("click", function () { onDelete(post); });
            main.append(del);
          }
          item.append(pic, main);
          list.append(item);
        });
      })
      .catch(function () { message.hidden = false; message.textContent = "Could not load posts."; });
  }

  return { show: show };
})();
