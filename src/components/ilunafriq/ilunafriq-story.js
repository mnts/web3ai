//import {styleSheets} from '../styling.js';
import {fix4name} from '/src/utilities/item.js';
import servers from '/src/data/servers.js';
import {find2define} from '/src/services/components.js';
import fractal_item from '../fractal-item/component.js';
import {LitElement, html, css} from "/node_mod/lit-element/lit-element.js";
const url = new URL(import.meta.url);

import shareStyle from "../shareStyle.js";
import shareButtons from "../share.js";

import account from '/src/account.js';


class Component extends fractal_item{
  static get is(){
    return 'ilunafriq-story';
  }

	

 render(){
        //  ?contenteditable='${this.classList.contains('toCreate')}'
    console.log(this.user);
    return html`
      <link rel="stylesheet" href="//${url.host}/src/components/fractal-item/style.css">

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <link rel="stylesheet" href="//${url.host}/design/tree.css" rel="preload" as="style">
      <style>
          .tree menu{
              display: none;
          }
      </style>
      
      <button id='x' @click='${this.deactivate}'></button>
      <main class=${this.own?'own':''}>
        <pineal-gallery id='gallery' @click='${this.activate}' src='${this.src || 'toCreate'}' view='${this.activated?'carousel':'fill'}'></pineal-gallery>
        
         <input 
          id='title'
          @change='${this.change}' 
          ?readonly='${!this.classList.contains('toCreate')}'
          @click='${this.activate}' 
          placeholder='Title'></input>

        <button id='rename' 
          @click='${this.do_rename}'
          ?hidden='${!this.own || this.classList.contains('toCreate')}'
         >&#xb6;</button>

        <textarea 
          id='description'
          @change='${this.change}' 
          placeholder='Short description' 
          ?disabled='${!this.own}'
        >${this.item.description}</textarea>

        <fractal-select disabled='${!this.own}' id='category' @selected='${this.selected_category}' list_src='${Cfg.story.categories_src}' selected_src='${this.item.parent}'>
            no category
        </fractal-select>
        
        ${this.been_activated?html`
          <fractal-htm id='article' ?editable='${!this.own}' ?disabled='${!this.own}' placeholder='Write your story here' src='${this.src}'></fractal-htm>
        `:''}
        

        <div id='info'>
          <div id="owner-block">
              <pineal-user id='owner-icon' @loaded='${this.on_user}' @click='${this.click_user}' path="${this.item.owner || this.user_item.owner}"></pineal-user>
              <div id='owner-info'>
                <a id='owner' href='${this.user && this.user.href}' target='_blank'>
                	${this.user_item.title  || ('#'+this.user.id)}
                </a>
                
                ${this.item.owner}&nbsp;
	            <!--<div id='owner_seeds' @click='${this.assign_seeds}'></div>-->
              </div>
              <button id='options' class='icon fas fa-ellipsis-v'></button>
          </div>

          <input name='value' title='seeds' type='number' disabled='disabled' @change='${this.change}' value='${this.item.value || 0}'/>
          
          <relative-time id='info-when' datetime='${this.datetime}'></relative-time>
          

          <div id="info-block">
              <span class="forPublished" id='stat-likes'>
                <fractal-rate @rate='${this.do_rate}' src='${this.src}'></fractal-rate>
                ${this.item.num_reviews || 0}
              </span>
              <span class="fas fa-eye forPublished" id='stat-views'>${this.item.num_views || 0}</span>
              <span @click='${this.activate_comm}' class="fas fa-comments forPublished" id='stat-comments'>${this.item.num_comments || 0}</span>
              <span class='fas fa-trash forCreate forEdit' @click='${this.do_remove}' id='stat-remove'>Remove</span>
              <span class='fas fa-check forCreate' @click='${this.do_publish}' id='stat-publish'>Publish</span>
          </div>

          <div id='share'>
			  <a href='https://www.facebook.com/sharer/sharer.php?u=${encodeURI('https://'+location.host+'/stories/'+this.item.name)}&t=${this.item.title}' class="resp-sharing-button__link" target='_blank' aria-label="Share on Facebook">
				<div class="resp-sharing-button resp-sharing-button--facebook resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
				  </div>Share on Facebook</div>
			  </a>

			  <a class="resp-sharing-button__link" href="https://twitter.com/intent/tweet/?text=${encodeURI('https://'+location.host+'/stories/'+this.item.name)}" target="_blank" rel="noopener" aria-label="Share on Twitter">
				<div class="resp-sharing-button resp-sharing-button--twitter resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>
				  </div>Tweet on Twitter</div>
			  </a>

			  <!-- Sharingbutton E-Mail -->
			  <a class="resp-sharing-button__link" href="mailto:?subject=Super%20fast%20and%20easy%20Social%20Media.&amp;body=${encodeURI('https://'+location.host+'/stories/'+this.item.name)}" target="_self" rel="noopener" aria-label="Share by E-Mail">
				<div class="resp-sharing-button resp-sharing-button--email resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 4H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.25 14.43l-3.5 2c-.08.05-.17.07-.25.07-.17 0-.34-.1-.43-.25-.14-.24-.06-.55.18-.68l3.5-2c.24-.14.55-.06.68.18.14.24.06.55-.18.68zm4.75.07c-.1 0-.2-.03-.27-.08l-8.5-5.5c-.23-.15-.3-.46-.15-.7.15-.22.46-.3.7-.14L12 13.4l8.23-5.32c.23-.15.54-.08.7.15.14.23.07.54-.16.7l-8.5 5.5c-.08.04-.17.07-.27.07zm8.93 1.75c-.1.16-.26.25-.43.25-.08 0-.17-.02-.25-.07l-3.5-2c-.24-.13-.32-.44-.18-.68s.44-.32.68-.18l3.5 2c.24.13.32.44.18.68z"/></svg></div>Send by E-Mail</div>
			  </a>     
	      </div>


          <div id='extra'></div>
          <div id='feedback-block'>
            ${this.been_activated?html`
              <fractal-comments src='${this.src}'></fractal-comments>
            `:''}
          </div>
        </div>

        <slot></slot>
      </main>
    `;
 }

  async updated(ch) {
    //super.firstUpdated(ch);
    super.updated();

    if(Cfg.story && Cfg.story.tree_src && this.link && !this.tree){
        this.select('#extra').innerHTML = `
            <pineal-tree src='${Cfg.story.tree_src}' item_src='${this.link.url}' id='tree'></pineal-tree>
        `;
        this.tree = this.select('#tree');
    }

    if(account.user && account.user.super){
        let inp = this.select('input[name=value]');
        inp.removeAttribute('disabled');
        inp.setAttribute('placeholder', 'Assign'); 
    }

    var owner_seeds = this.select('#owner_seeds')
    if(this.user && this.user.getValue && owner_seeds){
        owner_seeds.innerText = await this.user.getValue() || '';
    }
  }

  selected_category(ev){
  	var link = ev.detail.link;
  	this.link.set('parent', link.url);
  }


  click_user(ev){
  	this.select('#owner').click();
  }

  assign_seeds(ev){
 	if(!account.user || !account.user.super) return;
 	var num = parseInt(prompt(`Number of seeds ${this.user.email} has?`, this.user.value));

 	var acc_link = Link(`mongo://${Cfg.server}/acc?email=`+this.user.owner);
	acc_link.set('value', num).then(r => {
	});
		this.user.value = num;
		this.performUpdate();
  }
};


window.customElements.define(Component.is, Component);