/*
    "Pagii" v1.0
    Tumblr Plugin
    by cloudythms.tumblr.com
*/

// initialize plugin
function pagii(homepageHasPosts) {
    if (homepageHasPosts == null) {
        homepageHasPosts = true;
    }
    pagii_getPageTypes(homepageHasPosts).forEach(function(pageType) {
        $('body').addClass('-' + pageType);
    });
}

// check if page type is active
function isPageType(type) {
    return pagii_getPageTypes().includes(type);
}

// print all page types to console
function printPageTypes() {
    console.log('Page Types: ' + pagii_getPageTypes().join(', '));
}

// -----------------------------------------

$(document).ready(function() {
    $('body').addClass('-loaded');
});

$(window).bind('load', function() {
    $('body').addClass('-loaded-images');
});

// -----------------------------------------

let pagii_pageTypes = null;

function pagii_getPageTypes(homepageHasPosts) {
    if (!pagii_pageTypes) {
        pagii_pageTypes = pagii_generatePageTypes(homepageHasPosts);
    }
    return pagii_pageTypes;
}

function pagii_generatePageTypes(homepageHasPosts) {
    pagii_pageTypes = [];

    const url = window.location.pathname;

    if (url === '/') {
        pagii_pageTypes.push('home');
        if (homepageHasPosts) {
            pagii_pageTypes.push('posts');
        }
    } else if (strContains(url, '/page/')) {
        pagii_pageTypes.push('posts');
    }

    if (strContains(url, '/tagged/')) {
        pagii_pageTypes.push('posts');
        let searchAfter = '/tagged/';
        let startIndex = url.indexOf(searchAfter) + searchAfter.length;
        let endIndex = url.indexOf('/chrono');
        let tag;
        if (endIndex > 0) {
            tag = url.substring(startIndex, endIndex);
        } else {
            tag = url.substring(startIndex);
        }
        if (tag.endsWith('/')) {
            tag = tag.slice(0, -1);
        }
        if (strContains(url, '/page/')) {
            tag = tag.replace(/\/page\/\d+/i, '');
        }
        pagii_pageTypes.push('tag');
        pagii_pageTypes.push('tag-' + makeSafeForCSS(tag.replace('%20', '-'), false));
    } else if (strContains(url, '/search/')) {
        pagii_pageTypes.push('posts');
        let searchAfter = '/search/';
        let startIndex = url.indexOf(searchAfter) + searchAfter.length;
        let endIndex = url.indexOf('/chrono');
        let query;
        if (endIndex > 0) {
            query = url.substring(startIndex, endIndex);
        } else {
            query = url.substring(startIndex);
        }
        if (query.endsWith('/')) {
            query = query.slice(0, -1);
        }
        if (strContains(url, '/page/')) {
            query = query.replace(/\/page\/\d+/i, '');
        }
        pagii_pageTypes.push('search');
        pagii_pageTypes.push('search-' + makeSafeForCSS(query.replace('%20', '-'), false));
    } else if (strContains(url, '/day/')) {
        pagii_pageTypes.push('day');
        pagii_pageTypes.push('posts');
    } else if (strContains(url, '/post/')) {
        let searchAfter = '/post/';
        let startIndex = url.indexOf(searchAfter) + searchAfter.length;
        let indexOfSecondSlash = url.indexOf('/', startIndex);
        let id;
        if (indexOfSecondSlash >= 0) {
            id = url.substring(startIndex, url.indexOf('/', startIndex));
        } else {
            id = url.substring(startIndex);
        }
        pagii_pageTypes.push('post');
        pagii_pageTypes.push('post-' + id);
    } else if (url.endsWith('/ask')) {
        pagii_pageTypes.push('ask');
        pagii_pageTypes.push('page');
    } else if (url.endsWith('/submit')) {
        pagii_pageTypes.push('submit');
        pagii_pageTypes.push('page');
    } else {
        pagii_pageTypes.push('custom');
        pagii_pageTypes.push('page');
        let customUrl = url.substring(1);
        if (customUrl.endsWith('/')) {
            customUrl = customUrl.slice(0, -1);
        }
        pagii_pageTypes.push('custom-' + makeSafeForCSS(customUrl.replace('%20', '-'), false));
    }

    if (url.endsWith('/chrono')) pagii_pageTypes.push('chrono');

    let params = getGETParameters();
    if (params) {
        for (var prop in params) {
            if (params.hasOwnProperty(prop)) {
                pagii_pageTypes.push('param-' + makeSafeForCSS(prop, false));
                pagii_pageTypes.push('param-' + makeSafeForCSS(prop + '--' + params[prop], false));
            }
        }
    }

    var hash = $(location).attr('hash');
    if (hash) {
        pagii_pageTypes.push('anchor');
        pagii_pageTypes.push('anchor-' + makeSafeForCSS(hash.slice(1), false));
    }

    return pagii_pageTypes;
}

// helpers ----------------------------------

// check if a string exists and isn't empty
function stringOkay(str) {
    return !(!str || !(typeof str === 'string') || /^\s*$/.test(str));
}

// check if a string contains another string
function strContains(str, substr, caseSensitive = false, onlyMatchWholeWords = false) {
    if (!stringOkay(str) || !stringOkay(substr)) return false;
    if (!caseSensitive) {
        str = str.toLowerCase();
        substr = substr.toLowerCase();
    }
    if (onlyMatchWholeWords) {
        return new RegExp('\\b' + substr + '\\b').test(str);
    }
    return str.indexOf(substr) > -1;
}

// Get GET Paramters (e.g. ?something=bla) as object
function getGETParameters() {
    url = window.location.search;
    if (!stringOkay(url)) return null;
    paramArray = url
        .replace('?', '')
        .toLowerCase()
        .split('&');
    let paramObject = {};

    for (let i = 0; i < paramArray.length; i++) {
        let prop = paramArray[i].slice(0, paramArray[i].search('='));
        let value = paramArray[i].slice(paramArray[i].search('=')).replace('=', '');
        paramObject[prop] = value;
    }
    return paramObject;
}

// Make safe for CSS
function makeSafeForCSS(str, makeFirstCharSafe = true, prefix = '') {
    if (!stringOkay(str)) {
        return '';
    }
    let safeStr = str.trim().replace(/[^a-z0-9-_]/g, function(s) {
        let c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return s.toLowerCase();
        return '';
    });
    if (!stringOkay(safeStr)) {
        return '';
    }
    if (stringOkay(prefix)) {
        return makeSafeForCSS(prefix, makeFirstCharSafe) + safeStr;
    } else if (makeFirstCharSafe) {
        return makeFirstCharSafeForCSS(safeStr);
    } else {
        return safeStr;
    }
}

function makeFirstCharSafeForCSS(str, safeChar = '_') {
    if (firstCharIsNumber(str)) {
        let newStart = str.charAt(0).replace(/[^a-z-_]/g, safeChar + str.charAt(0));
        return newStart + str.substring(1);
    }
    return str;
}
