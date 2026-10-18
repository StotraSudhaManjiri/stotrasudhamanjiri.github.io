/* स्तोत्रसुधामंजिरी — shared client script.
   Each feature activates only when its elements exist on the page,
   so every layout can include this single file. */
(function () {
    'use strict';

    /* ---------- Saved-lists storage (localStorage) ---------- */
    var STORAGE_KEY = 'custom_lists';

    var Lists = {
        all: function () {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            } catch (e) {
                return {};
            }
        },
        write: function (lists) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
        },
        add: function (name, shloka) {
            var lists = this.all();
            var list = lists[name] || (lists[name] = []);
            var exists = list.some(function (s) { return s.url === shloka.url; });
            if (exists) return false;
            list.push(shloka);
            this.write(lists);
            return true;
        },
        remove: function (name) {
            var lists = this.all();
            delete lists[name];
            this.write(lists);
        },
        contains: function (url) {
            var lists = this.all();
            return Object.keys(lists).some(function (name) {
                return lists[name].some(function (s) { return s.url === url; });
            });
        }
    };

    /* ---------- Devata tag filter (index) ---------- */
    var directory = document.getElementById('shlokaDirectory');
    var filterNav = document.getElementById('devataFilter');
    if (directory && filterNav) {
        var items = Array.prototype.slice.call(directory.querySelectorAll('li'));
        var noResults = document.getElementById('noResults');
        var pills = Array.prototype.slice.call(filterNav.querySelectorAll('.devata-pill'));
        var activeDevata = null;

        var applyFilter = function () {
            var visible = 0;
            items.forEach(function (item) {
                var match = !activeDevata || item.dataset.devata === activeDevata;
                item.style.display = match ? '' : 'none';
                if (match) visible++;
            });
            if (noResults) noResults.hidden = visible > 0;
        };

        pills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                var devata = pill.dataset.devata;
                var turningOn = activeDevata !== devata;
                activeDevata = turningOn ? devata : null;
                pills.forEach(function (p) {
                    var isActive = turningOn && p === pill;
                    p.classList.toggle('active', isActive);
                    p.setAttribute('aria-pressed', String(isActive));
                });
                applyFilter();
            });
        });
    }

    /* ---------- Saved-state indicator on listings (index + devata pages) ---------- */
    var listedItems = Array.prototype.slice.call(document.querySelectorAll('li[data-url]'));
    if (listedItems.length) {
        listedItems.forEach(function (item) {
            if (Lists.contains(item.dataset.url)) item.classList.add('is-saved');
        });
    }

    /* ---------- Saved lists rendering (index) ---------- */
    var savedSection = document.getElementById('saved-section');
    var listsContainer = document.getElementById('custom-lists-container');
    if (savedSection && listsContainer) {
        var renderSavedLists = function () {
            var lists = Lists.all();
            var names = Object.keys(lists).sort(function (a, b) { return a.localeCompare(b); });
            savedSection.hidden = names.length === 0;
            listsContainer.textContent = '';

            names.forEach(function (name) {
                var wrapper = document.createElement('div');
                wrapper.className = 'saved-list';

                var heading = document.createElement('h3');
                heading.appendChild(document.createTextNode(name));

                var clearBtn = document.createElement('button');
                clearBtn.type = 'button';
                clearBtn.className = 'btn-small';
                clearBtn.textContent = 'Remove';
                clearBtn.addEventListener('click', function () {
                    if (confirm('Delete the list "' + name + '"?')) {
                        Lists.remove(name);
                        renderSavedLists();
                    }
                });
                heading.appendChild(clearBtn);
                wrapper.appendChild(heading);

                var ul = document.createElement('ul');
                ul.className = 'shloka-list';
                lists[name].forEach(function (shloka) {
                    var li = document.createElement('li');
                    var link = document.createElement('a');
                    link.href = shloka.url;
                    link.textContent = shloka.title;
                    li.appendChild(link);
                    ul.appendChild(li);
                });
                wrapper.appendChild(ul);

                listsContainer.appendChild(wrapper);
            });
        };
        renderSavedLists();
    }

    /* ---------- Save-to-list modal (shloka pages) ---------- */
    var saveBtn = document.getElementById('save-btn');
    var modal = document.getElementById('saveModal');
    if (saveBtn && modal) {
        var shloka = { title: saveBtn.dataset.title, url: saveBtn.dataset.url };
        var input = document.getElementById('listNameInput');
        var message = document.getElementById('modalMessage');

        var markSaved = function () {
            saveBtn.textContent = 'Saved';
            saveBtn.classList.add('is-saved');
        };
        if (Lists.contains(shloka.url)) markSaved();

        var openModal = function () {
            message.textContent = '';
            input.value = localStorage.getItem('last_list_name') || 'Favorites';
            modal.classList.add('active');
            input.focus();
            input.select();
        };
        var closeModal = function () {
            modal.classList.remove('active');
        };
        var save = function () {
            var name = input.value.trim();
            if (!name) {
                message.textContent = 'Please enter a name.';
                return;
            }
            if (Lists.add(name, shloka)) {
                localStorage.setItem('last_list_name', name);
                closeModal();
                markSaved();
            } else {
                message.textContent = 'Already in this list.';
            }
        };

        saveBtn.addEventListener('click', openModal);
        document.getElementById('modalSaveBtn').addEventListener('click', save);
        document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') save();
        });
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    }

    /* ---------- Font-size control (shloka pages) ---------- */
    var fontSmaller = document.getElementById('fontSmaller');
    var fontBigger = document.getElementById('fontBigger');
    var shlokaText = document.getElementById('shlokaText');
    if (fontSmaller && fontBigger && shlokaText) {
        var SIZES = ['1.05rem', '1.3rem', '1.6rem', '1.9rem'];
        var step = parseInt(localStorage.getItem('shloka_font_step'), 10);
        if (isNaN(step) || step < 0 || step >= SIZES.length) step = 1;

        var applySize = function () {
            shlokaText.style.setProperty('--shloka-size', SIZES[step]);
            localStorage.setItem('shloka_font_step', String(step));
        };
        applySize();

        fontSmaller.addEventListener('click', function () {
            if (step > 0) { step--; applySize(); }
        });
        fontBigger.addEventListener('click', function () {
            if (step < SIZES.length - 1) { step++; applySize(); }
        });
    }

    /* ---------- Copy shloka text (shloka pages) ---------- */
    var copyBtn = document.getElementById('copy-btn');
    var copyToast = document.getElementById('copyToast');
    if (copyBtn && shlokaText) {
        var showToast = function (msg) {
            copyToast.textContent = msg;
            copyToast.classList.add('show');
            setTimeout(function () { copyToast.classList.remove('show'); }, 1500);
        };
        copyBtn.addEventListener('click', function () {
            var text = shlokaText.innerText || shlokaText.textContent;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    showToast('Copied');
                }, function () {
                    showToast('Could not copy');
                });
            }
        });
    }

    /* ---------- PWA install prompt (index) ---------- */
    var installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
        var deferredPrompt = null;
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.hidden = false;
        });
        installBtn.addEventListener('click', function () {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function (choice) {
                if (choice.outcome === 'accepted') installBtn.hidden = true;
                deferredPrompt = null;
            });
        });
    }
})();
