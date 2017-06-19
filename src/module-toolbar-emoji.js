import Fuse from '../node_modules/fuse.js';
import {emojiList} from '../src/emojiList.js';

const Delta = Quill.import('delta');
const e = (tag, attrs, ...children) => {
    const elem = document.createElement(tag);
    Object.keys(attrs).forEach(key => elem[key] = attrs[key]);
    children.forEach(child => {
        if (typeof child === "string")
            child = document.createTextNode(child);
        elem.appendChild(child);
    });
    return elem;
};

const Embed = Quill.import('blots/embed');

class ImageBlot extends Embed {
  static create(value) {
    let node = super.create();
    let dataUrl = 'https://boltmedia-test.s3-ap-southeast-1.amazonaws.com/orgs/2/briefs/2/assignments/4/attachments/emoji.png';
    node.classList.add("emoji");
    node.dataset.unicode = value.unicode;
    node.classList.add("ap");
    node.classList.add("ap-"+value.name);
    node.setAttribute('alt', value.shortname);
    node.setAttribute('src', dataUrl);
    return node;
  }

  static value(node) {
    return {
      alt: node.getAttribute('alt'),
      url: node.getAttribute('src')
    };
  }
}

// class LinkBlot extends Inline {
//   static create(value) {
//     let node = super.create();
//     // Sanitize url value if desired
//     node.setAttribute('href', value);
//     node.classList.add("emojione");
//     node.classList.add("emojione-"+unicode);
//     // Okay to set other non-format related attributes
//     // These are invisible to Parchment so must be static
//     node.setAttribute('target', '_blank');
//     return node;
//   }

//   static formats(node) {
//     // We will only be called with a node already
//     // determined to be a Link blot, so we do
//     // not need to check ourselves
//     return node.getAttribute('href');
//   }
// }

// LinkBlot.blotName = 'cco';
// LinkBlot.tagName = 'a';

ImageBlot.blotName = 'bolt';
ImageBlot.tagName = 'img';

// EmojiBlot.blotName = "emoji";
// EmojiBlot.tagName = "a";
// EmojiBlot.className = "emojione";


// Quill.register({
//     'formats/emoji': EmojiBlot
// });

Quill.register({
    'formats/bolt': ImageBlot
});

// Quill.register({
//     'formats/cco': LinkBlot
// });


class ToolbarEmoji {
    constructor(quill){
        this.quill = quill;
        this.toolbar = quill.getModule('toolbar');
        if (typeof this.toolbar != 'undefined')
            this.toolbar.addHandler('emoji', this.checkPalatteExist);
        
        var emojiBtns = document.getElementsByClassName('ql-emoji');
        if (emojiBtns) { 
            [].slice.call( emojiBtns ).forEach(function ( emojiBtn ) {
                emojiBtn.innerHTML = '<svg viewbox="0 0 18 18"><circle class="ql-fill" cx="7" cy="7" r="1"></circle><circle class="ql-fill" cx="11" cy="7" r="1"></circle><path class="ql-stroke" d="M7,10a2,2,0,0,0,4,0H7Z"></path><circle class="ql-stroke" cx="9" cy="9" r="6"></circle></svg>';
            });
        };
    }

    checkPalatteExist() {
        let quill = this.quill;
        fn_checkDialogOpen(quill);
        this.quill.on('text-change', function(delta, oldDelta, source) {
            if (source == 'user') {
                fn_close();
                fn_updateRange(quill);
            }
        });
    }  
}

function fn_close(){
    let ele_emoji_plate = document.getElementById('emoji-palette');
    document.getElementById('emoji-close-div').style.display = "none";
    if (ele_emoji_plate) {ele_emoji_plate.remove()};
}

function fn_checkDialogOpen(quill){
    let elementExists = document.getElementById("emoji-palette");
    if (elementExists) {
        elementExists.remove();
    }
    else{
        fn_showEmojiPalatte(quill);
    }
}

function fn_updateRange(quill){
    let range = quill.getSelection();
    return range;
}

function fn_showEmojiPalatte(quill) {
    let ele_emoji_area = document.createElement('div');
    let toolbar_container = document.querySelector('.ql-toolbar');
    let range = quill.getSelection();
    const atSignBounds = quill.getBounds(range.index);

    quill.container.appendChild(ele_emoji_area);
    let paletteMaxPos = atSignBounds.left + 250;//palette max width is 250
    ele_emoji_area.id = 'emoji-palette';
    ele_emoji_area.style.top = 10 + atSignBounds.top + atSignBounds.height + "px";
    if (paletteMaxPos > quill.container.offsetWidth) {
        ele_emoji_area.style.left = (atSignBounds.left - 250)+ "px";
    }
    else{
        ele_emoji_area.style.left = atSignBounds.left + "px";
    }
    

    let tabToolbar = document.createElement('div');
    tabToolbar.id="tab-toolbar";
    ele_emoji_area.appendChild(tabToolbar);

    //panel
    let panel = document.createElement('div');
    panel.id="tab-panel";
    ele_emoji_area.appendChild(panel);

    var emojiType = [
        {'type':'p','name':'people','content':'<div class="i-people"></div>'},
        {'type':'n','name':'nature','content':'<div class="i-nature"></div>'},
        {'type':'d','name':'food','content':'<div class="i-food"></div>'},
        {'type':'s','name':'symbols','content':'<div class="i-symbols"></div>'},
        {'type':'a','name':'activity','content':'<div class="i-activity"></div>'},
        {'type':'t','name':'travel','content':'<div class="i-travel"></div>'},
        {'type':'o','name':'objects','content':'<div class="i-objects"></div>'},
        {'type':'f','name':'flags','content':'<div class="i-flags"></div>'}
    ];

    let tabElementHolder = document.createElement('ul');
    tabToolbar.appendChild(tabElementHolder);
    
    if (document.getElementById('emoji-close-div') === null) {
        let closeDiv = document.createElement('div');
        closeDiv.id = 'emoji-close-div';
        closeDiv.addEventListener("click", fn_close, false);
        document.getElementsByTagName('body')[0].appendChild(closeDiv); 
    }
    else{
        document.getElementById('emoji-close-div').style.display = "block";
    }
    
    
    emojiType.map(function(emojiType) {
        //add tab bar
        let tabElement = document.createElement('li');
        tabElement.classList.add('emoji-tab');
        tabElement.classList.add('filter-'+emojiType.name);
        let tabValue = emojiType.content;
        tabElement.innerHTML = tabValue;
        tabElement.dataset.filter = emojiType.type;
        tabElementHolder.appendChild(tabElement);
        
        let emojiFilter = document.querySelector('.filter-'+emojiType.name);
        emojiFilter.addEventListener('click',function(){ 
            let tab = document.querySelector('.active');
            if (tab) {
                tab.classList.remove('active');
            };
            emojiFilter.classList.toggle('active');
            fn_updateEmojiContainer(emojiFilter,panel,quill);
        })
    });
    fn_emojiPanelInit(panel,quill);
}

function fn_emojiPanelInit(panel,quill){
    fn_emojiElementsToPanel('p', panel, quill);
    document.querySelector('.filter-people').classList.add('active');
}

function fn_emojiElementsToPanel(type,panel,quill){
    let fuseOptions = {
                    shouldSort: true,
                    matchAllTokens: true,
                    threshold: 0.3,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 32,
                    minMatchCharLength: 3,
                    keys: [
                        "category"
                    ]
                };
    let fuse = new Fuse(emojiList, fuseOptions);
    let result = fuse.search(type);
    result.sort(function (a, b) {
      return a.emoji_order - b.emoji_order;
    });
    
    quill.focus();
    let range = fn_updateRange(quill);

    result.map(function(emoji) {
        let span = document.createElement('span');
        let t = document.createTextNode(emoji.shortname);
        span.appendChild(t);
        span.classList.add('bem');
        span.classList.add('bem-' + emoji.name);
        span.classList.add('ap');
        span.classList.add('ap-'+emoji.name);
        let output = ''+emoji.code_decimal+'';
        span.innerHTML = output + ' ';
        //span.innerHTML = ' ';
        panel.appendChild(span);
        
        let customButton = document.querySelector('.bem-' + emoji.name);
        if (customButton) {
            customButton.addEventListener('click', function() {
                let emoji_icon_html = e("span", {className: "ico", innerHTML: ''+emoji.code_decimal+' ' });
                let emoji_icon = emoji_icon_html.innerHTML;
                console.log(emoji_icon);

                // quill.insertText(range.index, emoji.shortname, "emoji", emoji.unicode);
                

                //const index = (quill.getSelection() || {}).index || quill.getLength();
                // let dataUrl = 'https://twemoji.maxcdn.com/16x16/'+emoji.unicode+'.png';
                quill.insertEmbed(range.index, 'bolt', emoji);
                //quill.insertText(index,emoji_icon, 'cco', emoji.unicode);
                //quill.insertText(range.index, emoji_icon);
                //console.log('cursor',range.index + emoji_icon.length + 1);
                //quill.setSelection(range.index + emoji.shortname.length + 1, 0);
                //console.log(quill);
                //twemoji.parse(quill.container);
                //range.index = range.index + emoji.shortname.length;

                //quill.focus();
                //quill.getBounds(10);
                fn_close();


                // quill.on('editor-change', function(delta, oldDelta, source) {
                //     console.log(delta);
                //   if (source == 'api') {
                //     console.log("An API call triggered this change.");
                //   } else if (source == 'user') {
                //     console.log("A user action triggered this change.");
                //   }
                // });               
                // let ops = [];
                // console.log(Delta);
                // quill.setContents([
                //   { insert: 'Hello ' },
                //   { insert: emoji_icon, attributes: { emoji: true } },
                //   { insert: ' ' },
                //   { insert: '\n' }
                // ]);
                //quill.insertText(range.index, emoji_icon);
                //quill.insertText(5, 'test', "separator", emoji.unicode);
                //quill.insertText(range.index, emoji_icon, "emoji", emoji.unicode);
                //quill.insertEmbed(10, 'image', 'https://boltmedia-test.s3-ap-southeast-1.amazonaws.com/orgs/10/briefs/684/assignments/773/attachments/canvas.png',emoji,emoji.unicode);
                // let temp = range.index + customButton.innerHTML.length;
                // console.log('hi there',temp);
                
                //console.log(quill.getSelection());
                //console.log('select',quill.getSelection());
                range.index = range.index + customButton.innerHTML.length;
            });
        };
    });
}

function fn_updateEmojiContainer(emojiFilter,panel,quill){ 
    while (panel.firstChild) {
        panel.removeChild(panel.firstChild);
    }
    let type = emojiFilter.dataset.filter;
    fn_emojiElementsToPanel(type,panel,quill);
}

Quill.register('modules/toolbar_emoji', ToolbarEmoji);
export { ToolbarEmoji as toolbarEmoji};
