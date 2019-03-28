const port = 5000;

document.addEventListener('DOMContentLoaded', function () {
    let retryTimeout = 1000;
    const updater = {
        poll: function () {
            const args = {'lastId': updater.cursor};
            const request = new XMLHttpRequest();
            request.open('POST', `http://localhost:${port}/updates`, true);
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            request.onload = function () {
                if (this.status >= 200 && this.status < 400)
                    updater.onSuccess(JSON.parse(this.responseText));
                else
                    console.log('404 or server side error');
            };
            request.onerror = function () {
                updater.onError(this.response);
            };
            request.send(JSON.stringify(args));
        },

        onSuccess: function (response) {
            try {
                if (response['success'] === true)
                    updater.newPosts(response);
                retryTimeout = 1000;
                window.setTimeout(updater.poll, 250);
            } catch (e) {
                updater.onError();
            }
        },

        onError: function (response) {
            retryTimeout *= 2;
            console.error(response);
            console.log(`Couldn\'t poll :( Will try another again in ${retryTimeout} ms`);
            window.setTimeout(updater.poll, updater.errorSleepTime);
        },

        newPosts: function (response) {
            if (!response.data)
                return;
            const posts = response.data;
            updater.cursor = posts[posts.length - 1].id;
            console.log(posts.length, 'new posts, last id:', updater.cursor);
            posts.forEach(updater.showPost);
        },

        showPost: function (post) {
            if (document.querySelector('#p' + post.id) !== null)
                return;
            createNode(post);
        },
    };

    function createNode (post) {
        const newEl = template.cloneNode(true);
        newEl.id = 'p' + post.id;
        newEl.style.display = 'flex';
        Object.entries({
            '.post-title': post.title,
            '.post-text': post.body,
            '.post-author': post.author,
        }).forEach(([key, value]) =>
            newEl.querySelector(key).textContent = value,
        );
        container.append(newEl);
    }

    const template = document.getElementById('p_id');
    const container = document.getElementById('post_container');

    const request = new XMLHttpRequest();
    request.open('GET', `http://localhost:${port}/`, false);
    request.send();

    const response = JSON.parse(request.responseText);
    if (response['success'] === true)
        response['data'].forEach(createNode);

    const {id: postId} = container.lastChild;
    updater.cursor = parseInt(postId.substring(1, postId.length));
    updater.poll();
}, false);
