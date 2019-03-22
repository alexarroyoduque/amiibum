import { LitElement, html, css } from 'lit-element';
/*
  If you want to call the service api you need uncomment:
  this.addServiceListener() in constructor()
  <amiibo-service> in render()
  Then comment:
  imports getAmiiboseries and getAllAmiibos
  this.getLocalAmiibos() in constructor()
*/

/* Comment this lines if you want to call the service api */
import {getAmiiboseries} from './mock-amiiboseries';
import {getAllAmiibos} from './mock-amiibos';
import {getCharacters} from './mock-characters';

/**/
import('./amiibo-header.js')
import('./amiibo-selector.js')
import('./amiibo-progress.js')
/* Uncomment this line if you want to call the service api */
// import('./amiibo-service.js')

export class AmiiboMain extends LitElement {
  static get properties() {
    return {
      loadComplete: {type: Boolean},
      allAmiibos: {type: Array},
      amiiboseries: {type: Array},
      allCharacters: {type: Array},
      seriesFilter: {type: String},
      characterFileter: {type: String},
      amiibosFiltered: {type: Array},
      filters: {type: Object}
    };
  }

  constructor() {
    super();
    this.loadComplete = false;
    this.filters = {series: undefined, character: undefined};
    this.allAmiibos = [];
    this.amiibosFiltered = [];
    this.amiiboseries = [];
    this.allCharacters = [];
    /* Comment this lines if you want to call the service api */
    this.getLocalAmiibos();
    /**/

    /* Uncomment this line if you want to call the service api */
    // this.addServiceListener();
    /**/
    
    this.addEventListener('selected-option-change-series', this.handleSeriesSelectedChange);
    this.addEventListener('selected-option-change-characters', this.handleCharactersSelectedChange);
    this.addEventListener('amiibo-checked-change', this.handleAmiiboCheckedChange);
  }

  firstUpdated() {
    this.loadLazy();
  }

  async loadLazy() {
    return import('./amiibo-item.js').then((LazyElement) => {
      this.loadComplete = true;
    }).catch((reason) => {
      console.log("LazyElement failed to load", reason);
    });
  }

  getLocalAmiibos() {
    this.amiiboseries = getAmiiboseries();
    this.allAmiibos = getAllAmiibos();
    this.allCharacters = getCharacters();
    this.loadInitialList();
  }

  addServiceListener() {
    this.addEventListener('service-response-amiibo', this.handleAmiiboEvent);
    this.addEventListener('service-response-amiiboseries', this.handleAmiiboSeriesEvent);
    this.addEventListener('service-response-character', this.handleCharacterEvent);
  }

  mergeStoredWithNewAmiibos() {
    let storedAmiibos = JSON.parse(localStorage.getItem('amiibos'));
    console.log(storedAmiibos.length);
    console.log(this.allAmiibos.length);
    if (storedAmiibos.length === this.allAmiibos.length) {
      this.allAmiibos.map(amiibo => amiibo.checked = false);
      this.amiibosFiltered = storedAmiibos;
      this.allAmiibos = this.amiibosFiltered;
    } else {
      this.allAmiibos.map(amiibo => amiibo.checked = false);
      let checkedAmiibos = storedAmiibos.filter(amiibo => amiibo.checked);
      checkedAmiibos.forEach(checkedAmiibos => {
        this.allAmiibos.find(amiibo => amiibo.tail === checkedAmiibos.tail).checked = true
      });
  
      localStorage.setItem('amiibos', JSON.stringify(this.allAmiibos));
      this.amiibosFiltered = this.allAmiibos;
    }
  }

  loadInitialList() {
    if (localStorage.getItem('amiibos')) {
      this.mergeStoredWithNewAmiibos();
    } else {
      this.allAmiibos.map(amiibo => amiibo.checked = false);
      this.amiibosFiltered = this.allAmiibos;
      localStorage.setItem('amiibos', JSON.stringify(this.allAmiibos));
    }
  }

  handleAmiiboEvent(event) {
    console.log(JSON.stringify(event.detail.amiibo));
    this.allAmiibos = event.detail.amiibo;
    this.loadInitialList();
  }

  handleAmiiboSeriesEvent(event) {
    console.log(JSON.stringify(event.detail.amiibo));
    this.amiiboseries = event.detail.amiibo;
  }

  handleCharacterEvent(event) {
    console.log(JSON.stringify(event.detail.amiibo));
    this.allCharacters = event.detail.amiibo;
  }

  applyFilters() {
    this.amiibosFiltered = this.allAmiibos;
    if (this.filters.series) {
      this.amiibosFiltered = this.allAmiibos.filter((amiibo)=> amiibo.amiiboSeries === this.filters.series);
    }

    if (this.filters.character) {
      this.amiibosFiltered = this.amiibosFiltered.filter((amiibo)=> amiibo.character === this.filters.character);
    }
  }

  handleSeriesSelectedChange(event) {
    this.amiibosFiltered = [];
    this.filters.series = event.detail === 'all' ? undefined : event.detail;
    setTimeout(() => {
      this.applyFilters();
    }, 0);
  }

  handleCharactersSelectedChange(event) {
    this.amiibosFiltered = [];
    this.filters.character = event.detail === 'all' ? undefined : event.detail;
    setTimeout(() => {
      this.applyFilters();
    }, 0);
  }

  handleAmiiboCheckedChange(event) {
    this.allAmiibos
      .find(amiibo => amiibo.tail === event.detail.tail)
      .checked = event.detail.checked;
    this.amiibosFiltered
      .find(amiibo => amiibo.tail === event.detail.tail)
      .checked = event.detail.checked;
    

    this.amiibosFiltered = this.amiibosFiltered.map(amiibo => amiibo);
    localStorage.setItem('amiibos', JSON.stringify(this.allAmiibos));
  }

  clearLocalStorage() {
    this.amiibosFiltered.map(amiibo => amiibo.checked = false);
    this.allAmiibos.map(amiibo => amiibo.checked = false);
    var temp = this.amiibosFiltered;
    this.amiibosFiltered = [];
    setTimeout(() => {
        this.amiibosFiltered = temp;
    }, 0);

    localStorage.clear();
  }

  static get styles() {
    return css`
      :host {
        --theme-title-font-family: Baumans;
        --theme-primary-font-family: Muli;
        --theme-secondary-font-family: Montserrat;
        --theme-color-light: #fff;
        --theme-color-light-gray: #F5F5F5;
        --theme-color-dark: #585858;

        --theme-color-primary: var(--theme-color-light);
        --theme-color-secondary: var(--theme-color-dark);
      }

      header {
        margin-bottom: 0.8rem;
        padding-bottom: 0.5rem;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.5);
        background: #f85032;  /* fallback for old browsers */
        background: -webkit-linear-gradient(to bottom, #e73827, #f85032);  /* Chrome 10-25, Safari 5.1-6 */
        background: linear-gradient(to bottom, #e73827, #f85032); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
        
        font-family: var(--theme-primary-font-family);
      }

      amiibo-header {
        --amiibo-header-title-font-family: var(--theme-title-font-family);
        --amiibo-header-subtitle-font-family: var(--theme-primary-font-family);
        --amiibo-header-color: var(--theme-color-primary);
      }

      amiibo-selector {
        --amiibo-selector-font-family: var(--theme-primary-font-family);
        --amiibo-selector-color: var(--theme-color-primary);
      }

      amiibo-progress {
        --amiibo-progress-font-family: var(--theme-primary-font-family);
        --amiibo-progress-color: var(--theme-color-light);
        --amiibo-progress-background-color: var(--theme-color-dark);
      }

      amiibo-item {
        --amiibo-item-font-family: var(--theme-secondary-font-family);
        --amiibo-item-color: var(--theme-color-dark);
      }

      .info {
        color: white;
        width: 100%;
        display: block;
        font-size: 0.7rem;
        opacity: .6;
        text-align: center;
      }
      
      .info a {
        color: white;
      }

      .info {
        padding-top: .3rem;
      }
      .info p {
        margin: 0;
      }
      .info .extra {
        font-style: italic;
      }

      .content {
        margin: 0 auto;
        max-width: 400px;
      }

      .selectors {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        width: 92%;
        margin: 0 auto;
      }

      .tools {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        width: 92%;
        margin: 0 auto;
      }

      .clear, .twitter {
        text-decoration: none;
        border: none;
        color: white;
        padding: 5px 10px;
        font-family: var(--theme-primary-font-family);
        font-size: 0.8rem;
        height: 32px;
        max-height: 32px;
        cursor: pointer;
        border-radius: 4px;
      }

      .clear {
        background-color: transparent;
        box-shadow: inset 0px 0px 0px 1px var(--theme-color-dark);
      }

      .clear:disabled {
        opacity: 0.3;
      }

      .twitter {
        background-color: #0492e3;
        display: block;
        height: 22px;
        max-height: 22px;
        line-height: 22px;
      }

      .clear:hover:not([disabled]) {
        background-color: #546E7A;
      }

      .twitter:hover {
        background-color: #0c7abf;
      }

      ul, li {
        padding: 0;
        margin: 0;
      }
      li {
        list-style: none;
        box-shadow: inset 0px -1px 0px 0px #E0E0E0;
        background-color: #F5F5F5;
      }
      :host([hidden]) { display: none; }
    `;
  } 

  render() {
    return html`
      <slot style="display: ${!this.loadComplete ? 'block' : 'none'}"></slot>
      <div class="content" style="visibility: ${this.loadComplete ? 'visible' : 'hidden'}">
        <!-- Uncomment this lines if you want to call the service api -->
        <!--
        <amiibo-service endpoint='amiibo'></amiibo-service>
        <amiibo-service endpoint='amiiboseries'></amiibo-service>
        <amiibo-service endpoint='character'></amiibo-service>
        -->
        <header>
          <div>
            <div class="info">
              <p><a href="https://github.com/alexarroyoduque/amiibo-album" title="source code" target="_blank">Project developed with lit-htm by AlexArroyoDuque</a></p>
              <p class="extra">Api by N3evin. Updated: March 2019</p>
            </div>
            <amiibo-header title="amiibum" subtitle="Album to check your collected amiibos"></amiibo-header>
          <div class="selectors">
            <div>
              <amiibo-selector suffix="-series" placeholder="All series (${this.amiiboseries.length})" placeholdervalue="all" options=${JSON.stringify(this.amiiboseries.map(serie => serie.name))}></amiibo-selector>
            </div>
            <div>
              <amiibo-selector suffix="-characters" placeholder="All characters (${this.allCharacters.length})" placeholdervalue="all" options=${JSON.stringify(this.allCharacters.map(character => character.name))}></amiibo-selector>
            </div>
          </div>
          <amiibo-progress max=${this.amiibosFiltered.length} current=${this.amiibosFiltered.filter(amiibo => amiibo.checked).length}></amiibo-progress>
          <div class="tools">
            <div>
              <button class="clear" ?disabled="${!this.amiibosFiltered.filter(amiibo => amiibo.checked).length}" @click="${this.clearLocalStorage}">RESET</button>
            </div>
            <div>
              <a class="twitter" target="_blank" href="https://twitter.com/intent/tweet?hashtags=amiibum&text=The album to check your collected amiibos&url=https://amiibum.firebaseapp.com&via=AlexArroyoDuque;">TWEET</a>
            </div>
          </div>
        </header>
        <article>
          <ul>
            ${this.amiibosFiltered.map(character => html`<li><amiibo-item amiibo=${JSON.stringify(character)}></amiibo-item></li>`)}
          </ul>
        </article>

      </div>
    `;
  }

}

// Register the element with the browser
customElements.define('amiibo-main', AmiiboMain);
