import { PolymerElement, html} from '@polymer/polymer/polymer-element.js';


class apps extends PolymerElement{
  static get template(){
    return html`
    <div>
      <slot name='apps'></div>
    </div><!--
      <iron-pages selected="[[page]]" attr-for-selected="name">
      detail of item --
        <template is="dom-if" if="[[_equal(page, 'detail')]]">
          <shrine-detail name="detail" section="[[sectionData.section]]" related-items="[[items]]" item="[[_getDetailItem(items, idData.id)]]">
          </shrine-detail>
        </template>
        <!-- list of items
        <template is="dom-if" if="[[_equal(page, 'list')]]">
          <shrine-list name="list" section="[[sectionData.section]]" items="[[_getItemsCopy(items, sectionData.section)]]" featured-item="[[_getFeaturedItem(featuredItems, sectionData.section)]]">
          </shrine-list>
        </template>
        -
        <slot name='apps'></div>
        <slot></slot>
      </iron-pages>
      -->
    `;
  }
}

window.customElements.define('pineal-apps', apps);
