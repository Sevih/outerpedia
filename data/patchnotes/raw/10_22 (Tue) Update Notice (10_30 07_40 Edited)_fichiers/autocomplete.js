(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = global || self, global.autocomplete = factory());
}(this, function () { 'use strict';

    /*
     * https://github.com/kraaden/autocomplete
     * Copyright (c) 2016 Denys Krasnoshchok
     * MIT License
     */
    function autocomplete(settings) {
        // just an alias to minimize JS file size
        var doc = document;
        var container = settings.container || doc.createElement("div");
        var icon = settings.icon;
        var containerStyle = container.style;
        var userAgent = navigator.userAgent;
        var mobileFirefox = userAgent.indexOf("Firefox") !== -1 && userAgent.indexOf("Mobile") !== -1;
        var debounceWaitMs = settings.debounceWaitMs || 0;
        var preventSubmit = settings.preventSubmit || false;
        // 'keyup' event will not be fired on Mobile Firefox, so we have to use 'input' event instead
        var keyUpEventName = mobileFirefox ? "input" : "keyup";
        var items = [];
        var inputValue = "";
        var minLen = 2;
        var showOnFocus = settings.showOnFocus;
        var selected;
        var keypressCounter = 0;
        var debounceTimer;
        if (settings.minLength !== undefined) {
            minLen = settings.minLength;
        }
        if (!settings.input) {
            throw new Error("input undefined");
        }
        var input = settings.input;
        container.className = settings.className || "";
        // IOS implementation for fixed positioning has many bugs, so we will use absolute positioning
        // containerStyle.position = "absolute";

        /**
         * clear option
         */
        var needClearItems = settings.needClearItems !== undefined ? settings.needClearItems : true;
        var needUpKeypressCounter = settings.needUpKeypressCounter !== undefined ? settings.needUpKeypressCounter : true;
        var needClearInputValue = settings.needClearInputValue !== undefined ? settings.needClearInputValue : true;
        var needClearSelected = settings.needClearSelected !== undefined ? settings.needClearSelected : true;

        /**
         * localStorage Cache
         */
        var intervalTimer;
        var interval = settings.interval || 500;

        function clearIntervalTimer() {
            intervalTimer = null;
        }

        /**
         * autoSelect Option
         */
        var autoSelect = settings.autoSelect || false;


        /**
         * sessionStorage Cache
         */
        var useCache = settings.useCache || false;

        function getCache(key) {
            var localData = window.sessionStorage.getItem(settings.suggestKey + '_' + key);
            return localData;
        }

        function setCache(key, list) {
            var localData = JSON.stringify(list);
            window.sessionStorage.setItem(settings.suggestKey + '_' + key, localData);
        }

        function processItemList(val, elements) {
            var itemList = elements;

            if (autoSelect) {
                var matchedList = elements.filter(function (item) {
                    return item.key === val;
                });

                var unMatchedItems = elements.filter(function(item) {
                    return item.key !== val;
                });


                matchedList.reverse().forEach(function(matchItem) {
                    unMatchedItems.unshift(matchItem);
                });

                itemList = unMatchedItems;

                selected = matchedList.length > 0 ? matchedList[0] : undefined;   //  ???
            }
            else {
                selected = undefined;
            }

            if (useCache && itemList.length !== 0) {
                setCache(val, itemList);
            }

            return itemList;
        }


        /**
         * Detach the container from DOM
         */
        function detach() {
            var parent = container.parentNode;
            if (parent) {
                parent.removeChild(container);
            }
        }
        /**
         * Clear debouncing timer if assigned
         */
        function clearDebounceTimer() {
            if (debounceTimer) {
                window.clearTimeout(debounceTimer);
            }
        }
        /**
         * Attach the container to DOM
         */
        function attach() {
            if (!container.parentNode) {
                doc.body.appendChild(container);
            }
        }
        /**
         * Check if container for autocomplete is displayed
         */
        function containerDisplayed() {
            return !!container.parentNode;
        }
        /**
         * Clear autocomplete state and hide container
         */
        function clear() {
            if (needUpKeypressCounter) {
                keypressCounter++;
            }

            if (needClearItems) {
                items = [];
            }

            if (needClearInputValue) {
                inputValue = "";
            }

            if (needClearSelected) {
                selected = undefined;
            }

            // detach();
        }
        /**
         * Update autocomplete position
         */
        function updatePosition() {
            if (!containerDisplayed()) {
                return;
            }
            containerStyle.height = "auto";
            containerStyle.width = input.offsetWidth + "px";
            var maxHeight = 0;
            var inputRect;
            function calc() {
                var docEl = doc.documentElement;
                var clientTop = docEl.clientTop || doc.body.clientTop || 0;
                var clientLeft = docEl.clientLeft || doc.body.clientLeft || 0;
                var scrollTop = window.pageYOffset || docEl.scrollTop;
                var scrollLeft = window.pageXOffset || docEl.scrollLeft;
                inputRect = input.getBoundingClientRect();
                var top = inputRect.top + input.offsetHeight + scrollTop - clientTop;
                var left = inputRect.left + scrollLeft - clientLeft;
                containerStyle.top = top + "px";
                containerStyle.left = left + "px";
                maxHeight = window.innerHeight - (inputRect.top + input.offsetHeight);
                if (maxHeight < 0) {
                    maxHeight = 0;
                }
                containerStyle.top = top + "px";
                containerStyle.bottom = "";
                containerStyle.left = left + "px";
                containerStyle.maxHeight = maxHeight + "px";
            }
            // the calc method must be called twice, otherwise the calculation may be wrong on resize event (chrome browser)
            calc();
            calc();
            if (settings.customize && inputRect) {
                settings.customize(input, inputRect, container, maxHeight);
            }
        }
        /**
         * Redraw the autocomplete div element with suggestions
         */
        function update() {
            // delete all children from autocomplete DOM container
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            // function for rendering autocomplete suggestions
            var render = function (item, currentValue) {
                var itemElement = doc.createElement("div");
                itemElement.textContent = item.label || "";
                return itemElement;
            };

            if (settings.render) {
                render = settings.render;
            }
            // function to render autocomplete groups
            var renderGroup = function (groupName, currentValue) {
                var groupDiv = doc.createElement("div");
                groupDiv.textContent = groupName;
                return groupDiv;
            };
            if (settings.renderGroup) {
                renderGroup = settings.renderGroup;
            }
            var fragment = doc.createDocumentFragment();
            var prevGroup = "#9?$";

            items.length && settings.callback && settings.callback()
            
            items.forEach(function(item) {
                if (item.group && item.group !== prevGroup) {
                    prevGroup = item.group;
                    var groupDiv = renderGroup(item.group, inputValue);
                    if (groupDiv) {
                        groupDiv.className += " group";
                        fragment.appendChild(groupDiv);
                    }
                }
                var div = render(item, inputValue);
                if (div) {
                    div.addEventListener("click", function(ev) {
                        settings.onSelect(item, input);
                        clear();
                        ev.preventDefault();
                        ev.stopPropagation();
                    });
                    if (item === selected) {
                        div.className += "selected";
                    }
                    fragment.appendChild(div);
                }
            });
            container.appendChild(fragment);
            if (items.length < 1) {
                // if (settings.emptyMsg) {
                //     var empty = doc.createElement("div");
                //     empty.className = "empty";
                //     empty.textContent = settings.emptyMsg;
                //     container.appendChild(empty);
                // }
                // else {
                render(null, inputValue);
                clear();
                // return;
                // }
            }
            attach();
            // updatePosition();
            updateScroll();
        }
        function updateIfDisplayed() {
            if (containerDisplayed()) {
                update();
            }
        }
        function resizeEventHandler() {
            updateIfDisplayed();
        }
        function scrollEventHandler(e) {
            if (e.target !== container) {
                updateIfDisplayed();
            }
            else {
                e.preventDefault();
            }
        }
        function keyupEventHandler(ev) {
            var keyCode = ev.which || ev.keyCode || 0;
            var ignore = [38 /* Up */, 13 /* Enter */, 27 /* Esc */, 39 /* Right */, 37 /* Left */, 16 /* Shift */, 17 /* Ctrl */, 18 /* Alt */, 20 /* CapsLock */, 91 /* WindowsKey */];
            for (var _i = 0, ignore_1 = ignore; _i < ignore_1.length; _i++) {
                var key = ignore_1[_i];
                if (keyCode === key) {
                    return;
                }
            }
            // the down key is used to open autocomplete
            if ((keyCode === 40 /* Down */ || keyCode === 9 /* Tab */) && containerDisplayed()) {
                return;
            }


            if (!intervalTimer) {
                intervalTimer = window.setTimeout(function() {
                    startFetch(0 /* Keyboard */);
                }, interval);
            }
            //startFetch(0 /* Keyboard */);
        }
        /**
         * Automatically move scroll bar if selected item is not visible
         */
        function updateScroll() {
            var elements = container.getElementsByClassName("selected");
            if (elements.length > 0) {
                var element = elements[0];
                // make group visible
                var previous = element.previousElementSibling;
                if (previous && previous.className.indexOf("group") !== -1 && !previous.previousElementSibling) {
                    element = previous;
                }
                if (element.offsetTop < container.scrollTop) {
                    container.scrollTop = element.offsetTop;
                }
                else {
                    var selectBottom = element.offsetTop + element.offsetHeight;
                    var containerBottom = container.scrollTop + container.offsetHeight;
                    if (selectBottom > containerBottom) {
                        container.scrollTop += selectBottom - containerBottom;
                    }
                }
            }
        }
        /**
         * Select the previous item in suggestions
         */
        function selectPrev() {
            if (items.length < 1) {
                selected = undefined;
            }
            else {
                if (selected === items[0]) {
                    selected = items[items.length - 1];
                }
                else {
                    for (var i = items.length - 1; i > 0; i--) {
                        if (selected === items[i] || i === 1) {
                            selected = items[i - 1];
                            break;
                        }
                    }
                }
            }
        }
        /**
         * Select the next item in suggestions
         */
        function selectNext() {
            if (items.length < 1) {
                selected = undefined;
            }
            if (!selected || selected === items[items.length - 1]) {
                selected = items[0];
                return;
            }
            for (var i = 0; i < (items.length - 1); i++) {
                if (selected === items[i]) {
                    selected = items[i + 1];
                    break;
                }
            }
        }
        function keydownEventHandler(ev) {
            var keyCode = ev.which || ev.keyCode || 0;
            if (keyCode === 38 /* Up */ || keyCode === 40 /* Down */ || keyCode === 27 /* Esc */ || keyCode === 9 /* Tab */) {
                var containerIsDisplayed = containerDisplayed();
                if (keyCode === 27 /* Esc */) {
                    clear();
                }
                else {
                    if (!containerDisplayed || items.length < 1) {
                        return;
                    }
                    keyCode === 38 /* Up */
                        ? selectPrev()
                        : selectNext();
                        if (input.value.trim().length >= minLen) {
                            update();
                        }
                }
                ev.preventDefault();
                if (containerIsDisplayed) {
                    ev.stopPropagation();
                }
                return;
            }
            if (keyCode === 13 /* Enter */) {
                if (selected) {
                    settings.onSelect(selected, input);
                    clear();
                    ev.preventDefault();
                }
            }
        }
        function focusEventHandler() {
            if (showOnFocus) {
                startFetch(1 /* Focus */);
            }
        }
        function startFetch(trigger) {
            // if multiple keys were pressed, before we get update from server,
            // this may cause redrawing our autocomplete multiple times after the last key press.
            // to avoid this, the number of times keyboard was pressed will be
            // saved and checked before redraw our autocomplete box.
            var savedKeypressCounter = ++keypressCounter;
            var val = input.value;
            clearIntervalTimer();
            if (val.length >= minLen) {
                clearDebounceTimer();
                debounceTimer = window.setTimeout(function () {
                    //    구린내
                    if (useCache && getCache(val)) {  //  cache 처리
                        var searchList = null;
                        try {
                            searchList = JSON.parse(getCache(val));
                        } catch (error) {
                            console.warn(error);
                        }
                        items = searchList;
                        if ((trigger === 3 && items.length > 0) || trigger !== 3) {
                            update();
                        }
                        return;
                    }

                    settings.fetch(val, function (elements) {
                        if (keypressCounter === savedKeypressCounter && elements) {
                            inputValue = val;
                            items = processItemList(val, elements);
                            if ((trigger === 3 && items.length > 0) || trigger !== 3) {
                                update();
                            }
                        }
                        else {    //    검색목록 저장
                            processItemList(val, elements);
                        }
                    }, 0 /* Keyboard */);
                }, trigger === 0 /* Keyboard */ ? debounceWaitMs : 0);
            }
            else {
                if (val.trim() === '') {
                    container.innerHTML = '';
                    return;
                }
                clear();
            }
        }
        function blurEventHandler() {
            // we need to delay clear, because when we click on an item, blur will be called before click and remove items from DOM
            setTimeout(function () {
                if (doc.activeElement !== input) {
                    clear();
                }
            }, 200);
        }

        function pasteEventHandler(event) {
            var clipboardValue = event.clipboardData.getData('text');
            setTimeout(function () {
                var isPaste = clipboardValue !== "" && clipboardValue.trim() === input.value.trim();
                if (isPaste) {
                    startFetch(2 /* Paste */);
                }
            }, 200);
        }

        function clickEventHandler(event) {
            var inputValue = event.target.previousElementSibling.value || '';
            if (container.style.display === 'none' && inputValue.trim().length > 0) {
                startFetch(3 /* Click */);
            }
        }
        /**
         * Fixes #26: on long clicks focus will be lost and onSelect method will not be called
         */
        container.addEventListener("mousedown", function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
        });
        /**
         * This function will remove DOM elements and clear event handlers
         */
        function destroy() {
            input.removeEventListener("focus", focusEventHandler);
            input.removeEventListener("keydown", keydownEventHandler);
            input.removeEventListener(keyUpEventName, keyupEventHandler);
            input.removeEventListener("blur", blurEventHandler);
            input.removeEventListener("paste", pasteEventHandler);
            // window.removeEventListener("resize", resizeEventHandler);
            if (icon) {
                icon.removeEventListener("click", clickEventHandler);
            }
                // doc.removeEventListener("scroll", scrollEventHandler, true);
            clearDebounceTimer();
            clear();
            // prevent the update call if there are pending AJAX requests
            keypressCounter++;
        }
        // setup event handlers
        input.addEventListener("keydown", keydownEventHandler);
        input.addEventListener(keyUpEventName, keyupEventHandler);
        input.addEventListener("blur", blurEventHandler);
        input.addEventListener("focus", focusEventHandler);
        input.addEventListener("paste", pasteEventHandler);
        // window.addEventListener("resize", resizeEventHandler);
        // doc.addEventListener("scroll", scrollEventHandler, true);
        if (icon) {
            icon.addEventListener("click", clickEventHandler);
        }
        return {
            destroy: destroy
        };
    }

    return autocomplete;

}));
