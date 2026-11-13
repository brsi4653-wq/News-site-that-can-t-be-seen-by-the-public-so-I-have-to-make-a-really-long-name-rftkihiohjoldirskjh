// Shows a creator's posts and the replies under them. Used by their page
// and by their admin page. Everything people type is added as plain text,
// never as HTML, so nothing typed can run as code on the page.
var mayhemPosts = (function () {
  var when = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" });
  var LINK = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  // A link to a YouTube video, an X post or a video file plays in the post
  function videoFor(url) {
    var m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) return { type: "youtube", id: m[1] };
    m = url.match(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]+)\/status\/(\d+)/);
    if (m) return { type: "x", user: m[1], id: m[2] };
    if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return { type: "file", url: url };
    return null;
  }

  function player(video) {
    var box = el("div", "post__video");
    if (video.type === "youtube") {
      var frame = el("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + video.id;
      frame.title = "Video";
      frame.loading = "lazy";
      frame.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      frame.allowFullscreen = true;
      box.append(frame);
    } else if (video.type === "file") {
      var film = el("video");
      film.src = video.url;
      film.controls = true;
      film.preload = "metadata";
      film.playsInline = true;
      box.append(film);
    } else {
      box.className = "post__xpost";
      var quote = el("blockquote", "twitter-tweet");
      quote.setAttribute("data-theme", "dark");
      quote.setAttribute("data-dnt", "true");
      var link = el("a", "", "Watch on X");
      link.href = "https://twitter.com/" + video.user + "/status/" + video.id;
      quote.append(link);
      box.append(quote);
      if (window.twttr && twttr.widgets) twttr.widgets.load(box);
      else if (!player.loading) {
        player.loading = true;
        var s = el("script");
        s.src = "https://platform.twitter.com/widgets.js";
        s.async = true;
        document.head.append(s);
      }
    }
    return box;
  }

  // Puts text into a paragraph with web links made clickable. With
  // allowVideo, the first video link is left out of the text and returned.
  function fill(node, text, allowVideo) {
    var video = null;
    text.split(LINK).forEach(function (part, i) {
      if (i % 2) {
        if (allowVideo && !video) { video = videoFor(part); if (video) return; }
        var link = el("a", "", part.replace(/^https?:\/\//, ""));
        link.href = part;
        link.rel = "noopener nofollow";
        link.target = "_blank";
        node.append(link);
      } else if (part) {
        node.append(part);
      }
    });
    node.normalize();
    if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.textContent = node.lastChild.textContent.replace(/\s+$/, "");
    return video;
  }

  // The spam check is only loaded when someone opens a reply box
  var checkWaiting = [];
  function withCheck(run) {
    if (window.turnstile) return run();
    checkWaiting.push(run);
    if (withCheck.loading) return;
    withCheck.loading = true;
    window.__mayhemCheckReady = function () { checkWaiting.forEach(function (f) { f(); }); checkWaiting = []; };
    var s = el("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__mayhemCheckReady";
    s.async = true;
    document.head.append(s);
  }

  function replyForm(box, post, redraw) {
    var form = el("form", "reply__form");
    form.noValidate = true;
    var name = el("input");
    name.type = "text"; name.name = "name"; name.maxLength = 40; name.placeholder = "Your name"; name.autocomplete = "nickname";
    name.setAttribute("aria-label", "Your name");
    try { name.value = localStorage.getItem("mayhem-reply-name") || ""; } catch (e) {}
    var body = el("textarea");
    body.name = "body"; body.rows = 3; body.maxLength = 1000; body.placeholder = "Write a reply";
    body.setAttribute("aria-label", "Your reply");
    var trap = el("input", "reply__trap");
    trap.type = "text"; trap.name = "website"; trap.tabIndex = -1; trap.autocomplete = "off";
    trap.setAttribute("aria-hidden", "true");
    var check = el("div", "reply__check");
    var send = el("button", "xpost", "Reply");
    send.type = "submit";
    var note = el("p", "reply__note");
    note.setAttribute("role", "status");
    form.append(name, body, trap, check, send, note);
    var widget = null;
    withCheck(function () { widget = turnstile.render(check, { sitekey: box.getAttribute("data-sitekey"), theme: "dark" }); });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!name.value.trim() || !body.value.trim()) { note.textContent = "Please enter your name and a reply."; return; }
      var token = widget !== null && window.turnstile ? turnstile.getResponse(widget) : "";
      if (!token) { note.textContent = "Please wait for the spam check, then send again."; return; }
      send.disabled = true;
      note.textContent = "Sending.";
      try { localStorage.setItem("mayhem-reply-name", name.value.trim()); } catch (e) {}
      fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ creator: box.getAttribute("data-posts"), action: "reply", post: post.id, name: name.value, body: body.value, website: trap.value, token: token }),
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
          if (res.ok) return redraw();
          note.textContent = res.data.error || "Something went wrong. Please try again.";
          send.disabled = false;
          if (window.turnstile && widget !== null) turnstile.reset(widget);
        })
        .catch(function () { note.textContent = "Something went wrong. Please try again."; send.disabled = false; });
    });
    return form;
  }

  // tools is optional: { deletePost, deleteReply }. When given, posts and
  // replies get Delete buttons (the admin page).
  function show(box, tools) {
    tools = tools || {};
    var list = box.querySelector("[data-posts-list]");
    var message = box.querySelector("[data-posts-message]");
    var avatar = box.getAttribute("data-avatar");
    var redraw = function () { return show(box, tools); };
    return fetch("/api/posts?creator=" + encodeURIComponent(box.getAttribute("data-posts")))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var posts = data.posts || [];
        list.textContent = "";
        message.textContent = posts.length ? "" : "No posts yet.";
        message.hidden = posts.length > 0;
        document.querySelectorAll("[data-posts-count]").forEach(function (count) {
          count.textContent = posts.length + (posts.length === 1 ? " post" : " posts");
        });
        posts.forEach(function (post) {
          var item = el("li", "post");
          var pic = el("div", "post__avatar");
          if (avatar) { var img = new Image(); img.src = avatar; img.alt = ""; pic.append(img); }
          var main = el("div", "post__main");
          var head = el("p", "post__head");
          var time = el("time", "", when.format(new Date(post.created_at)));
          time.dateTime = post.created_at;
          head.append(el("span", "post__name", box.getAttribute("data-name")), el("span", "post__handle", box.getAttribute("data-handle")), time);
          var body = el("p", "post__body");
          var video = fill(body, post.body, true);
          main.append(head);
          if (body.textContent) main.append(body);
          if (video) main.append(player(video));

          var replies = post.replies || [];
          var actions = el("div", "post__actions");
          var replyButton = el("button", "post__reply", replies.length ? "Reply (" + replies.length + ")" : "Reply");
          replyButton.type = "button";
          actions.append(replyButton);
          if (tools.deletePost) {
            var del = el("button", "post__delete", "Delete post");
            del.type = "button";
            del.addEventListener("click", function () { tools.deletePost(post); });
            actions.append(del);
          }
          main.append(actions);

          if (replies.length) {
            var thread = el("ol", "replies");
            replies.forEach(function (r) {
              var row = el("li", "reply");
              var rhead = el("p", "post__head");
              var rtime = el("time", "", when.format(new Date(r.created_at)));
              rtime.dateTime = r.created_at;
              rhead.append(el("span", "post__name", r.name), rtime);
              var rbody = el("p", "post__body");
              fill(rbody, r.body, false);
              row.append(rhead, rbody);
              if (tools.deleteReply) {
                var rdel = el("button", "post__delete", "Delete reply");
                rdel.type = "button";
                rdel.addEventListener("click", function () { tools.deleteReply(r); });
                row.append(rdel);
              }
              thread.append(row);
            });
            main.append(thread);
          }

          var form = null;
          replyButton.addEventListener("click", function () {
            if (!form) { form = replyForm(box, post, redraw); main.append(form); }
            else form.hidden = !form.hidden;
            if (!form.hidden) form.querySelector("input").value ? form.querySelector("textarea").focus() : form.querySelector("input").focus();
          });

          item.append(pic, main);
          list.append(item);
        });
      })
      .catch(function () { message.hidden = false; message.textContent = "Could not load posts."; });
  }

  return { show: show };
})();
