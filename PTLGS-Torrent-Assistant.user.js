// ==UserScript==
// @name         ptlgs-Torrent-Assistant
// @namespace    https://userscripts.ptl.gs/PTLGS-Torrent-Assistant.user.js
// @updateURL    https://userscripts.ptl.gs/PTLGS-Torrent-Assistant.user.js
// @downloadURL  https://userscripts.ptl.gs/PTLGS-Torrent-Assistant.user.js
// @homepage     https://ptlgs.org/
// @namespace    http://tampermonkey.net/
// @version      1.1.43
// @description  劳改所审种助手
// @author       LGS
// @include      http*://ptlgs.org/details.php*
// @include      http*://ptlgs.org/offers.php*off_details*
// @include      http*://ptlgs.org/torrents.php*
// @include      http://localhost-dev.ptl.gs:3081/details.php*
// @include      http://localhost-dev.ptl.gs:3081/offers.php*off_details*
// @include      http://localhost-dev.ptl.gs:3081/torrents.php*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      movie.douban.com
// @connect      gifyu.com
// @connect      imgbox.com
// @connect      pixhost.to
// @connect      ptpimg.me
// @connect      ibb.pics
// @connect      *
// @license      MIT
// ==/UserScript==
(function () {
    'use strict';

    const $ = jQuery;


    //种审判断
    //=====================================
    var isEditor;
    if (GM_info.script.name === "ptlgs-Torrent-Assistant 测试版") {
        isEditor = GM_getValue('isEditor', true);
    } else {
        isEditor = GM_getValue('isEditor', false);
    }

    if (window.location.href.includes("/details.php") || window.location.href.includes("/offers.php")) {
        $('#outer').prepend('<div style="display: inline-block; padding: 10px 30px; color: white; background: red; font-weight: bold;margin-bottom: 10px" id="assistant-tooltips"></div>');

        // 查找目标div
        var targetDiv = document.querySelector('#assistant-tooltips');
        if (targetDiv) {
            // 创建包含多选框和标签的新div
            var containerDiv = document.createElement('div');
            containerDiv.style.cssText = 'display: inline-block; margin-left: 20px; vertical-align: top;';

            // 创建换行元素并插入
            var breakElement = document.createElement('br');
            targetDiv.parentNode.insertBefore(breakElement, targetDiv.nextSibling);
            targetDiv.parentNode.insertBefore(containerDiv, breakElement.nextSibling);
        }
        if (isEditor) {
            $('#assistant-tooltips').after('<br/><div style="display: inline-block; padding: 10px 30px; color: white; background: DarkSlateGray; font-weight: bold;" id="editor-tooltips"></div>');
        }

        var cat_constant = {
            401: "电影",
            402: "剧集",
            403: "综艺",
            404: "纪录片",
            405: "动漫",
            406: "音乐",
            407: "体育",
            409: "其他",
            410: "游戏"
        };

        var type_constant = {
            14: "Blu-ray",
            8: "Remux",
            5: "BDRip",
            4: "WEB-DL",
            7: "WEBRiP",
            3: "HDTV",
            2: "TVRip",
            1: "DVD",
            11: "DVDRiP",
            15: "CD",
            12: "Other"
        };

        var encode_constant = {
            6: "H.265/HEVC",
            7: "H.264/AVC",
            2: "VC-1",
            4: "MPEG-2",
            5: "Other"
        };

        var audio_constant = {
            10: "DTS-HD",
            12: "TrueHD",
            8: "LPCM",
            19: "DTS",
            9: "AC-3",
            11: "AAC",
            13: "FLAC",
            14: "APE",
            1: "WAV",
            6: "MP3",
            7: "Other"
        };

        var resolution_constant = {
            6: "2160p",
            1: "1080p",
            2: "1080i",
            3: "720p",
            4: "SD",
            7: "Other"
        };

        var group_constant = {
            17: "DYZ-WEB",
            15: "DYZ-Movie",
            14: "DYZ-TV",
            9: "beAst",
            11: "ZmWeb",
            13: "Other"
        };

        var title = $('h1#top > .name').text();
        var exclusive = 0;
        if (title.indexOf('禁转') >= 0) {
            exclusive = 1;
        }

        title = title.trim();
        console.log(title);

        var title_lowercase = title.toLowerCase();
        var title_type, title_encode, title_audio, title_resolution, title_group, title_is_complete;

        // 格式
        if (/[.| ]remux/.test(title_lowercase)) {
            title_type = 8;
        } else if (/[.| ]bdrip/.test(title_lowercase) || (/([.| ]bluray|[.| ]blu-ray)/.test(title_lowercase) && /[.| ]x26[45]/.test(title_lowercase))) {
            title_type = 5;
        } else if (/([.| ]bluray|[.| ]blu-ray)/.test(title_lowercase)) {
            title_type = 14;
        } else if (/[.| ]webrip/.test(title_lowercase) || (/[.| ]web[.| ]/.test(title_lowercase) && /[.| ]x26[45]/.test(title_lowercase))) {
            title_type = 7;
        } else if (/([.| ]web-dl|[.| ]webdl|[.| ]web[.| ])/.test(title_lowercase)) {
            title_type = 4;
        } else if (/[.| ]tvrip/.test(title_lowercase)) {
            title_type = 2;
        } else if (/([.| ]hdtv|[.| ]hdtv[.| ])/.test(title_lowercase)) {
            title_type = 3;
        } else if (/[.| ]dvdrip/.test(title_lowercase) || ((/([.| ]dvd|[.| ]dvd[.| ])/.test(title_lowercase)) && /[.| ]x26[45]/.test(title_lowercase))) {
            title_type = 11;
        } else if (/([.| ]dvd|[.| ]dvd[.| ])/.test(title_lowercase)) {
            title_type = 1;
        }


        // codec
        if (/([.| ]x265|[.| ]h265|[.| ]h\.265|[.| ]hevc)/.test(title_lowercase)) {
            title_encode = 6;
        } else if (/([.| ]x264|[.| ]h264|[.| ]h\.264|[.| ]avc)/.test(title_lowercase)) {
            title_encode = 7;
        } else if (/([.| ]vc-1|[.| ]vc1)/.test(title_lowercase)) {
            title_encode = 2;
        } else if (/(mpeg2|mpeg-2)/.test(title_lowercase)) {
            title_encode = 4;
        }

        // audiocodec
        if (/[.| ](dts-hd|dtshd|dts-x|dts:x)/.test(title_lowercase)) {
            title_audio = 10;
        } else if (/[.| ]truehd/.test(title_lowercase)) {
            title_audio = 12;
        } else if (/[.| ]lpcm|[.| ]pcm/.test(title_lowercase)) {
            title_audio = 8;
        } else if (/[.| ]dts/.test(title_lowercase)) {
            title_audio = 19;
        } else if (/[.| ]ac3|[.| ]ac-3|[.| ]ddp|[.| ]dd\+|[.| ]dd2|[.| ]dd5|[.| ]dd\.2|[.| ]dd\.5/.test(title_lowercase)) {
            title_audio = 9;
        } else if (/[.| ]aac/.test(title_lowercase)) {
            title_audio = 11;
        } else if (/[.| ]flac/.test(title_lowercase)) {
            title_audio = 13;
        }

        // standard
        if (!/remastered/.test(title_lowercase) && (/[.| ]2160p/.test(title_lowercase) || (/[.| ]uhd/.test(title_lowercase) && !/[.| ]1080p/.test(title_lowercase)) || /[.| ]4k[.| ]/.test(title_lowercase))) {
            title_resolution = 6;
        } else if (/[.| ]1080p/.test(title_lowercase)) {
            title_resolution = 1;
        } else if (/[.| ]1080i/.test(title_lowercase)) {
            title_resolution = 2;
        } else if (/[.| ]720p/.test(title_lowercase)) {
            title_resolution = 3;
        } else {
            title_resolution = 7;
        }
        if (/complete/.test(title_lowercase)) {
            title_is_complete = true;
        }

        // 发布组选择
        if (/dyz-web/.test(title_lowercase)) {
            title_group = 17;
        } else if (/dyz-movie/.test(title_lowercase)) {
            title_group = 15;
        } else if (/dyz-tv/.test(title_lowercase)) {
            title_group = 14;
        } else if (/beast/.test(title_lowercase)) {
            title_group = 9;
        } else if (/zmweb/.test(title_lowercase)) {
            title_group = 11;
        }

        console.log('title_type:', title_type, 'title_encode:', title_encode, 'title_audio:', title_audio, 'title_resolution:', title_resolution, 'title_group:', title_group, 'title_is_complete:', title_is_complete);


        var subtitle, cat, type, encode, audio, resolution, group, anonymous;
        var poster;
        var fixtd, douban, imdb, mediainfo_title, mediainfo_s, torrent_extra, douban_raw;
        var sub_chinese, audio_chinese, is_complete, is_chinese, is_dovi, is_hdr, is_hlg,
            is_c_dub, is_bd, is_cc, is_anime;
        //var tdlist = $('#top').next('table').find('td');
        var tdlist = $('#top').next('table').find('td').length !== 0 ? $('#top').next('table').find('td') : $('#top').next().next('table').find('td')
        // Mediainfo 信息

        mediainfo_s = Array.from($('.mediainfo tr')).map(x => $(x).text()).join('\n');
        mediainfo_title = $('.nexus-media-info-raw pre').text();
        for (var i = 0; i < tdlist.length; i++) {
            var td = $(tdlist[i]);

            if (td.text() === '副标题' || td.text() === '副標題') {
                subtitle = td.parent().children().last().text();
            }

            if (td.text() === '添加') {
                let text = td.parent().children().last().text();
                if (text.indexOf('匿名') >= 0) {
                    anonymous = 1;
                }
            }

            if (td.text() === '基本信息') {

                var catText = $('b[title="类型"]').next('span').text();
                var typeText = $('b[title="媒介"]').next('span').text();
                var encodeText = $('b[title="视频编码"]').next('span').text();
                var audioText = $('b[title="音频编码"]').next('span').text();
                var resolutionText = $('b[title="分辨率"]').next('span').text();
                var areaText = $('b[title="地区"]').next('span').text();
                var authorText = $('b[title="制作组"]').next('span').text();
                console.log(catText + typeText + encodeText + audioText + resolutionText + areaText + authorText)


                for (const [key, value] of Object.entries(cat_constant).sort((a, b) => b[1].length - a[1].length)) {
                    if (catText.indexOf(value) >= 0) {
                        cat = key;
                        break;
                    }
                }

                for (const [key, value] of Object.entries(type_constant).sort((a, b) => b[1].length - a[1].length)) {
                    if (typeText.indexOf(value) >= 0) {
                        type = key;
                        break;
                    }
                }

                for (const [key, value] of Object.entries(encode_constant).sort((a, b) => b[1].length - a[1].length)) {
                    if (encodeText.indexOf(value) >= 0) {
                        encode = key;
                        break;
                    }
                }

                for (const [key, value] of Object.entries(audio_constant).sort((a, b) => b[1].length - a[1].length)) {
                    if (audioText.indexOf(value) >= 0) {
                        audio = key;
                        break;
                    }
                }

                for (const [key, value] of Object.entries(resolution_constant).sort((a, b) => b[1].length - a[1].length)) {
                    if (resolutionText.indexOf(value) >= 0) {
                        resolution = key;
                        break;
                    }
                }

                for (const [key, value] of Object.entries(group_constant).sort((a, b) => b[1].length - a[1].length)) {
                    if (authorText.indexOf(value) >= 0) {
                        group = key;
                        break;
                    }
                }
                console.log('cat:', cat, 'type:', type, 'encode:', encode, 'audio:', audio, 'resolution:', resolution, 'group:', group);

            }

            if (td.text() === '行为') {
                fixtd = td.parent().children().last();
            }

            if (td.text().trim() === '海报') {
                poster = $('#kposter').children().attr('src');
            }

            if (td.text() === '标签') {
                let text = td.parent().children().last().text();

                // 使用正则表达式进行匹配
                if (/合集/.test(text)) {
                    is_complete = true;
                }
                if (/中字/.test(text)) {
                    is_chinese = true;
                }
                if (/HDR/.test(text)) {
                    is_hdr = true;
                }
                if (/DoVi/.test(text)) {
                    is_dovi = true;
                }
                if (/HLG/.test(text)) {
                    is_hlg = true;
                }
                if (/国配/.test(text)) {
                    is_c_dub = true;
                }
                if (/原生/.test(text)) {
                    is_bd = true;
                }
                if (/cc/.test(text)) {
                    is_cc = true;
                }
                if (/动画/.test(text)) {
                    is_anime = true;
                }
            }
            if (td.text().trim() === '其它信息') {
                torrent_extra = $('#kdescr').html();
            }
            if (td.text() === '字幕') {
                var lastChild = td.parent().children().last();
                var img = lastChild.find('div img[title="简体中文"]');
                // 查找 lastChild 内的第一个超链接并获取其文本内容
                var firstLinkText = lastChild.find('a:first').text();
                // 检查文本内容是否包含"chs"或"cht"
                let sub = firstLinkText.includes('chs') || firstLinkText.includes('cht');
                if (img.length > 0 || sub || /字\s*幕.*?Chinese/i.test(mediainfo_s) || /字\s*幕.*?Mandarin/i.test(mediainfo_s) || /Subtitle:\s*?Chinese/i.test(mediainfo_s)) {
                    sub_chinese = true;
                } else {
                    sub_chinese = false;
                }
            }
            if (td.text().trim().startsWith('豆瓣')) {
                douban_raw = td.parent().children().last();
            }
        }


        // 豆瓣
        $('div.douban-info h2 a').each(function (index, element) {
            if ($(element).attr('href').indexOf('douban') >= 0) {
                douban = $(element).text();
            }
            if ($(element).attr('href').indexOf('imdb') >= 0) {
                imdb = $(element).text();
            }
        });


        // 中文音轨识别
        if ((/音\s频:.*?chinese.*?(字\s幕)/i.test(mediainfo_s) && type !== 1) || (/Audio:\s?Chinese/i.test(mediainfo_s) && type === 1)) {
            audio_chinese = true;
        }
        var screenshot = '';
        var imageCount = 0;
        $('#ktorrentscreenshots img').each(function (index, element) {
            var src = $(element).attr('src');
            if (src !== undefined) {
                if (index !== 0) {
                    screenshot += '\n';
                }
                screenshot += src.trim();
            }
            imageCount++;
        });


        //==============================
        let error = false;
        if (/[\u4e00-\u9fa5\uff01-\uff60]+/.test(title)) {
            $('#assistant-tooltips').append('主标题包含中文或中文字符<br/>');
            error = true;
        }
        if (/-(FGT|NSBC|BATWEB|GPTHD|DreamHD|BlackTV|CatWEB|Xiaomi|Huawei|MOMOWEB|DDHDTV|SeeWeb|TagWeb|SonyHD|MiniHD|BitsTV|CTRLHD|ALT|NukeHD|ZeroTV|HotTV|EntTV|GameHD|SmY|SeeHD|VeryPSP|DWR|XLMV|XJCTV|Mp4Ba|GodDramas|FRDS|BeiTai|Ying|VCB-Studio)/.test(title_lowercase)) {
            $('#assistant-tooltips').append('主标题包含禁发小组，请检查<br/>');
            error = true;
        }
        if (!subtitle) {
            $('#assistant-tooltips').append('副标题为空<br/>');
            error = true;
        }
        if (/[【】]/.test(subtitle)) {
            $('#assistant-tooltips').append('副标题包含【】，请修改为 []<br/>');
            error = true;
        }
        if (!cat) {
            $('#assistant-tooltips').append('未选择分类<br/>');
            error = true;
        }
        if (!type) {
            $('#assistant-tooltips').append('未选择格式<br/>');
            error = true;
        } else {
            if (title_type && +title_type !== +type) {
                $('#assistant-tooltips').append("标题检测格式为" + type_constant[title_type] + "，选择格式为" + type_constant[type] + '<br/>');
                error = true;
            }
        }
        if (!encode) {
            $('#assistant-tooltips').append('未选择主视频编码<br/>');
            error = true;
        } else {
            if (title_encode && +title_encode !== +encode) {
                $('#assistant-tooltips').append("标题检测视频编码为" + encode_constant[title_encode] + "，选择视频编码为" + encode_constant[encode] + '<br/>');
                error = true;
            } else if (encode === 99 && +group !== 8) {
                $('#assistant-tooltips').append('视频编码选择为 other，请人工检查<br/>');
                error = true;
            }
        }
        if (!audio) {
            $('#assistant-tooltips').append('未选择主音频编码<br/>');
            error = true;
        } else {
            if (title_audio && +title_audio !== +audio) {
                $('#assistant-tooltips').append("标题检测音频编码为" + audio_constant[title_audio] + "，选择音频编码为" + audio_constant[audio] + '<br/>');
                error = true;
            } else if (audio === 99) {
                $('#assistant-tooltips').append('音频编码选择为 other，请人工检查<br/>');
                error = true;
            }
        }
        if (!resolution) {
            $('#assistant-tooltips').append('未选择分辨率<br/>');
            error = true;
        } else {
            if (title_resolution && +title_resolution !== +resolution) {
                $('#assistant-tooltips').append("标题检测分辨率为" + resolution_constant[title_resolution] + "，选择分辨率为" + resolution_constant[resolution] + '<br/>');
                error = true;
            }
        }
        if (/tu\.totheglory\.im/.test(poster)) {
            $('#assistant-tooltips').append('海报使用防盗链图床，请更换或留空<br/>');
            error = true;
        }
        if (type === 1 && $('.mediainfo-short .codetop').text() === 'MediaInfo') {
            $('#assistant-tooltips').append('Blu-ray 媒体信息请使用 BDInfo<br/>');
            error = true;
        }

        if ((type === 6 || type === 4 || type === 7 || type === 8 || type === 9 || type === 10) && $('.mediainfo-short .codemain').text().replace(/\s+/g, '') === $('.mediainfo-raw .codemain').text().replace(/\s+/g, '')) {
            $('#assistant-tooltips').append('媒体信息未解析<br/>');
            error = true;
        }
        // 标签
        if (sub_chinese && !is_chinese) {
            $('#assistant-tooltips').append('未选择「中字」标签<br/>');
            error = true;
        }
        if (/^(?!Encoding).*Dolby Vision/im.test(mediainfo_title) && !is_dovi) {
            $('#assistant-tooltips').append('未选择「DoVi」标签<br/>');
            error = true;
        }
        if (!/^(?!Encoding).*Dolby Vision/im.test(mediainfo_title) && is_dovi) {
            $('#assistant-tooltips').append('选择「DoVi」标签，未识别到「DoVi」<br/>');
            error = true;
        }
        if (/^(?!Encoding).*HDR10/im.test(mediainfo_title) && !/^(?!Encode).*HDR10\+/im.test(mediainfo_title) && !is_hdr) {
            $('#assistant-tooltips').append('未选择「HDR」标签<br/>');
            error = true;
        }
        if (!/^(?!Encoding).*HDR10/im.test(mediainfo_title) && is_hdr) {
            $('#assistant-tooltips').append('选择「HDR」标签，未识别到「HDR」<br/>');
            error = true;
        }
        if (/^(?!Encoding).*HLG/im.test(mediainfo_title) && !is_hlg) {
            $('#assistant-tooltips').append('未选择「HLG」标签<br/>');
            error = true;
        }
        if (!/^(?!Encoding).*HLG/im.test(mediainfo_title) && is_hlg) {
            $('#assistant-tooltips').append('选择「HLG」标签，未识别到「HLG」<br/>');
            error = true;
        }
        if ((/<img\s+[^>]*>|◎/i.test(torrent_extra)) && !$('span[title="制作组"]').length > 0) {
            $('#assistant-tooltips').append('请移除其它信息中除致谢、制作信息以外的内容。<br/>');
            error = true;
        }
        if (mediainfo_s.length < 30) {
            error = true;
            if (type === 1 || type === 3) {
                $('#assistant-tooltips').append('媒体信息格式错误，请使用「BDInfo」重新获取完整的英文信息<br/>');
            } else {
                $('#assistant-tooltips').append('媒体信息格式错误，请使用「Mediainfo」重新获取完整的英文信息<br/>');
            }
        }

        if (title_group && !group) {
            $('#assistant-tooltips').append('未选择制作组' + group_constant[title_group] + '<br/>');
            error = true;
        }

        if (imageCount < 1) {
            $('#assistant-tooltips').append('截图未满 1 张<br/>');
            error = true;
        }

        const pichost_list = [
            'files.ptlgs.org',
            'cmct.xyz',
            "static.ssdforum.org",
            'static.hdcmct.org',
            'gifyu.com',
            'imgbox.com',
            'pixhost.to',
            'ptpimg.me',
            'ssdforum.org'
        ];
        const shot = document.querySelector('section.screenshots-container');
        let shot_imgs = [];
        if (shot) {
            shot_imgs = Array.from(shot.querySelectorAll('img')).map(el => el.src);
        }
        $(document).ready(function () {
            let wrongPicList = [];
            if (shot_imgs.length) {
                shot_imgs.forEach(imgSrc => {
                    let valid = pichost_list.some(site => imgSrc.includes(site));
                    if (!valid) {
                        wrongPicList.push(imgSrc);
                    }
                });
                if (wrongPicList.length) {
                    $('#assistant-tooltips').append('请使用规则白名单内的图床<br/>');
                    error = true;
                }
            }
        });


        // =================================
        // 种审用（检测较为激进，需配合人工判断）
        // =================================
        if (isEditor) {

            $('#editor-tooltips').append('↓以下检测较为激进，需配合人工判断↓<br/>');
            if (!(title_is_complete || /[集期]全|全\s*?[\d一二三四五六七八九十百千]*\s*?[集期]|合集/i.test(subtitle)) && is_complete) {
                $('#editor-tooltips').append('主副标题未识别到「合集」相关字符，请检查<br/>');
            }
            if (/^\s*(概览|概要)/i.test(mediainfo_title)) {
                $('#editor-tooltips').append('检测到「中文Mediainfo」，请重新扫描<br/>');
            }
            if ((/\.(hdr|hdr10)\./i.test(title_lowercase) || /BT\.2020/i.test(mediainfo_title)) && !/ST\s2086|ST\s2094|HDR\sVivid/i.test(mediainfo_title) && !/Transfer\scharacteristics\s*:\sHLG/i.test(mediainfo_title) && $('.mediainfo-short .codetop').text() === 'MediaInfo') {
                $('#editor-tooltips').append('主标题检测到HDR，未识别到「HDR」相关元数据，请重新扫描 Mediainfo<br/>');
            }
            if (/\.(Criterion|CC)\./i.test(title_lowercase) || /CC标准收藏版|CC收藏版|CC版|CC(?!TV)/i.test(subtitle) && !is_cc) {
                $('#editor-tooltips').append('主副标题识别到「CC」相关字符，请检查是否有「CC」标签<br/>');
            }
            if (/版原盘/i.test(subtitle) && !is_bd) {
                $('#editor-tooltips').append('副标题识别到「原盘」相关字符，请检查是否有「原生」标签<br/>');
            }
            if (/SUBtitleS:/.test(mediainfo_title)) {
                $('#editor-tooltips').append('识别到「SUBtitleS:」相关字符，请检查BDInfo<br/>');
            }
            console.log("(mediainfo_title.match(/[^\\S\\r\\n]/g) || []).length" + (mediainfo_title.match(/(?<!\S)[ ]{2,}(?!\S)/g) || []).length)
            if ((mediainfo_title.match(/(?<!\S)[ ]{2,}(?!\S)/g) || []).length < 30 && type != 1) {
                $('#editor-tooltips').append('识别到「mediainfo」空格字符过少，请检查排版是否正确<br/>');
            }
            if (/HDR\sformat.*dvhe\.05/i.test(mediainfo_title)) {
                $('#editor-tooltips').append('DUPE参考：Dolby Vision P5（不含 HDR10 数据）<br/>');
            }
            if (/HDR\sformat.*dvhe\.08/i.test(mediainfo_title) || /HDR\sformat.*dvhe\.07/i.test(mediainfo_title)) {
                $('#editor-tooltips').append('DUPE参考：Dolby Vision P7 or P8（含 HDR10 数据）<br/>');
            }
            if (!sub_chinese && is_chinese) {
                $('#editor-tooltips').append('选择「中字」标签，未识别到中文字幕，请检查<br/>');
            }
            if (/((FLUX|HHWEB|HHCLUB).*字幕|字幕.*(FLUX|HHWEB|HHCLUB)|DIY)/i.test(torrent_extra) && type === 7) {
                $('#editor-tooltips').append('添加字幕后修改原视频后缀的「WEB-DL」资源，此类资源应保留原组名后缀<br/>');
            }
            if (/Progressive/i.test(mediainfo_title) && resolution === 3) {
                $('#editor-tooltips').append('扫描方式为 Progressive，分辨率为 1080i<br/>');
            }

            if (
                (/^(?:Format).*?(DTS-HD|TrueHD|DTS:X|LPCM|Format\s+:\s+PCM\s+Format settings\s+:\s+Little\s+\/\s+Signed)/im.test(
                        mediainfo_title
                    ) ||
                    audio === 1 ||
                    audio === 2 ||
                    audio === 6) &&
                (resolution === 2 ||
                    resolution === 3 ||
                    resolution === 4 ||
                    resolution === 5) &&
                (type === 6 || type === 8 || type === 9 || type === 10)
            ) {
                $("#editor-tooltips").append("可替代：音频臃肿<br/>");
            }
            if (!sub_chinese && !is_bd) {
                $('#editor-tooltips').append('可替代：无中字或硬字幕<br/>');
            }
            if ((/x264/i.test(title_lowercase) && /10bit/i.test(title_lowercase)) || (/Bit\s+depth\s*:\s*10\s+bits/i.test(mediainfo_title) && /Writing\s+library\s*:\s*x264/i.test(mediainfo_title))) {
                $('#editor-tooltips').append('可替代：x264 10bit 硬件兼容性较差<br/>');
            }
        }

        //豆瓣判断
        // 函数：获取对应豆瓣内容
        function findDouban(searchText) {
            var result = null; // 存储找到的结果

            // 遍历所有的p元素
            douban_raw.find('p').each(function () {
                // 获取当前.peer元素中的.text-title和.text-content
                var textTitle = $(this).find('.text-title').text().trim();
                var textContent = $(this).find('.text-content').text().trim(); // 使用.html()以保留内部HTML结构，如链接

                // 检查.text-title是否包含搜索的文本
                if (textTitle.includes(searchText)) {
                    result = textContent;
                    return false; // 找到匹配后退出循环
                }
            });

            return result; // 返回结果，如果没有找到匹配项，则为null
        }


        // 豆瓣判断
        var douban_area, douban_cat;
        var isshow, isdoc, isani;
        if (douban) {

            var douban_genres = findDouban('类别') || '';
            if (douban_genres.includes('真人秀')) {
                isshow = 1;
            }
            if (douban_genres.includes('纪录片')) {
                isdoc = 1;
            }
            if (douban_genres.includes('动画')) {
                isani = true;
            }
            var douban_type = (findDouban('类型') || '').split(" / ")[0];
            var country = (findDouban('产地') || '').split(" / ")[0];
            console.log('country' + country); // 打印找到的内容或null

            // 定义包含所有欧美国家的数组
            const europeanAndAmericanCountries = [
                '阿尔巴尼亚', '爱尔兰', '爱沙尼亚', '安道尔', '奥地利', '白俄罗斯', '保加利亚',
                '北马其顿', '比利时', '冰岛', '波黑', '波兰', '丹麦', '德国', '法国',
                '梵蒂冈', '芬兰', '荷兰', '黑山', '捷克', '克罗地亚', '拉脱维亚', '立陶宛',
                '列支敦士登', '卢森堡', '罗马尼亚', '马耳他', '摩尔多瓦', '摩纳哥', '挪威',
                '葡萄牙', '瑞典', '瑞士', '塞尔维亚', '塞浦路斯', '圣马力诺', '斯洛伐克',
                '斯洛文尼亚', '乌克兰', '西班牙', '希腊', '匈牙利', '意大利', '英国',
                '安提瓜和巴布达', '巴巴多斯', '巴哈马', '巴拿马', '伯利兹', '多米尼加', '多米尼克',
                '格林纳达', '哥斯达黎加', '古巴', '海地', '洪都拉斯', '加拿大', '美国', '墨西哥',
                '尼加拉瓜', '萨尔瓦多', '圣基茨和尼维斯', '圣卢西亚', '圣文森特和格林纳丁斯',
                '特立尼达和多巴哥', '危地马拉', '牙买加', '阿根廷', '巴拉圭', '巴西', '秘鲁',
                '玻利维亚', '厄瓜多尔', '哥伦比亚', '圭亚那', '苏里南', '委内瑞拉', '乌拉圭', '智利', '捷克斯洛伐克'
            ];

            if (douban_type === '电视剧') {
                if (isshow) {
                    douban_cat = 403;
                } else if (isdoc) {
                    douban_cat = 404;
                } else {
                    douban_cat = 402;
                }
            } else {
                if (isdoc) {
                    douban_cat = 404;
                } else {
                    douban_cat = 409;
                }
            }

            if (cat && douban_cat && douban_cat >= 401 && douban_cat <= 408 && douban_cat !== parseInt(cat)) {
                $('#assistant-tooltips').append("豆瓣检测分类为" + cat_constant[douban_cat] + "，选择分类为" + cat_constant[cat] + '<br/>');
                error = true;
            }

            if (!isani && is_anime) {
                $('#assistant-tooltips').append('选择「动画」标签，豆瓣未识别到「动画」类别<br/>');
                error = true;
            }
        }

        //显示结果
        if (error) {
            $('#assistant-tooltips').css('background', 'red');
        } else {
            $('#assistant-tooltips').append('此种子未检测到异常');
            $('#assistant-tooltips').css('background', 'green');
        }

    }

    // ---------------------------------------------------
    // 只有种审需要下面的功能捏
    // ---------------------------------------------------
    if (isEditor) {
        // ===========================================
        // 调用函数，移动包含特定文本“相关资源”的tr到表格顶端
        // ===========================================
        function updateRowAndToggleImage(searchText) {
            // 获取页面中所有的tr元素
            const trElements = document.querySelectorAll('tr');

            // 遍历所有tr元素
            trElements.forEach(tr => {
                // 在当前tr中查找所有td元素
                const tdElements = tr.querySelectorAll('td.rowhead.nowrap');

                // 遍历这些td元素
                tdElements.forEach(td => {
                    // 检查td元素的文本内容是否为searchText（传入的参数）
                    if (td.textContent.trim() === searchText) {
                        // 检查是否存在img元素且其类名包含'minus'
                        const img = td.querySelector('img.minus');
                        if (img) {
                            // 将img的类名改为'plus'
                            img.className = 'plus';
                        }

                        // 获取这个tr的父表格
                        const table = tr.closest('table');
                        if (table) {
                            // 将这个tr移动到表格的最顶端
                            table.insertBefore(tr, table.firstChild);
                        }

                        // 找到id为'krelated'的div并清除其style属性
                        const relatedDiv = document.getElementById('krelated');
                        if (relatedDiv) {
                            relatedDiv.style = "display: none;";
                        }
                    }
                });
            });
        }

        if (window.location.href.includes("/details.php?")) {
            updateRowAndToggleImage("相关资源");
        }
    }


    // ===========================================
    // 2. << 添加隐藏已审按钮和 torrents.php 页面下的功能 >>
    // ===========================================
    // 添加隐藏已审按钮和 torrents.php 页面下的功能
    function enhanceTorrentsPage() {

        let buttonTop = 10; // 初始按钮位置
        const buttonSpacing = 30; // 按钮间隔

        // 按钮配置
        const buttons = [
            {
                text: '隐藏已审',
                action: () => {
                    // 隐藏已审的行
                    jQuery('span[title="通过"]').closest('table').closest('tr').hide();
                }
            },
            {text: '显示所有', action: () => jQuery('table.torrents tr').show()},
        ];

        // 创建按钮和输入框
        buttons.forEach(btn => createButton(btn.text, btn.action));

        function createButton(text, onClickFunction) {
            const button = document.createElement('button');
            button.textContent = text;
            button.style.cssText = `position:fixed;top:${buttonTop}px;right:10px;z-index:1000;`;
            document.body.appendChild(button);
            button.onclick = onClickFunction;
            buttonTop += buttonSpacing;
        }

        function createInput(placeholder, localStorageKey) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.style.cssText = `position:fixed;top:${buttonTop}px;right:10px;z-index:1000;width:120px;`;
            document.body.appendChild(input);
            input.value = localStorage.getItem(localStorageKey) || '';
            input.addEventListener('input', () => {
                localStorage.setItem(localStorageKey, input.value);
            });
            buttonTop += buttonSpacing;
            return input;
        }
    }

    if (window.location.href.includes("/torrents.php")) {
        enhanceTorrentsPage();
    }
})();
