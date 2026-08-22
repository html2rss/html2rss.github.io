function e(e){let t=e.indexOf(`/`);return t===-1?e:e.slice(0,t)}var t=[1],n=class extends Error{constructor(e=`Catalog is disabled on this instance.`){super(e),this.name=`CatalogDisabledError`}},r=class extends Error{constructor(e=`Could not reach the instance catalog.`){super(e),this.name=`CatalogNetworkError`}},i=class extends Error{constructor(e=`The instance returned an invalid catalog response.`){super(e),this.name=`CatalogInvalidEnvelopeError`}},a=class extends Error{constructor(e=`This instance returned an unsupported catalog version.`){super(e),this.name=`CatalogUnsupportedVersionError`}};function o(e){return typeof e==`object`&&!!e}function s(e){return typeof e==`string`&&e.trim()?e:void 0}function c(e){return Array.isArray(e)?e.filter(e=>typeof e==`string`&&e.trim().length>0):[]}function l(e){if(!o(e))return{};let t={};for(let[n,r]of Object.entries(e)){if(!o(r))continue;let e=s(r.type);e&&(t[n]={type:e})}return t}function u(e){if(!o(e))return{};let t={};for(let[n,r]of Object.entries(e))typeof r==`string`&&(t[n]=r);return t}function d(t){if(!Array.isArray(t))return[];let n=[];for(let r of t){if(!o(r))continue;let t=r,i=s(t.id),a=s(t.path),d=s(t.channel?.url);!i||!a||!d||n.push({id:i,path:a,siteKey:e(i),title:s(t.directory?.title)??i,summary:s(t.directory?.summary)??``,topics:c(t.directory?.topics),channelUrl:d,language:s(t.channel?.language)??``,parameterSchema:l(t.parameters?.schema),parameterDefaults:u(t.parameters?.defaults)})}return n}function f(e){let n=e?.catalog_version;if(typeof n!=`number`||!Number.isFinite(n))throw new i;if(!t.includes(n))throw new a;return n}function p(e){if(!o(e))throw new i;let t=e;if(t.success!==!0||!o(t.data))throw new i;let n=d(t.data.configs),r=f(t.meta),a=t.meta?.total;return{entries:n,meta:{total:typeof a==`number`&&Number.isFinite(a)?a:n.length,catalogVersion:r}}}async function m(e,t=fetch){let a=new URL(`/api/v1/configs`,e).toString(),o;try{o=await t(a,{headers:{Accept:`application/json`}})}catch{throw new r}if(o.status===404)throw new n;if(!o.ok)throw new r(`Catalog request failed with status ${o.status}.`);let s;try{s=await o.json()}catch{throw new i}return p(s)}function h(e){return e instanceof n?{kind:`disabled`,message:`This instance has the feed catalog disabled.`}:e instanceof a?{kind:`unsupported_version`,message:`This instance returned an unsupported catalog version.`}:e instanceof i?{kind:`invalid`,message:`The instance returned an unexpected catalog response.`}:e instanceof r?{kind:`network`,message:`Could not load the feed catalog from this instance.`}:{kind:`unknown`,message:`Could not load the feed catalog.`}}function g(e){if(!e)return null;let t=e.trim();return t&&t.split(/[-_]/)[0]?.toLowerCase()||null}function _(e,t){if(!t)return!0;let n=g(e),r=g(t);return n!==null&&r!==null&&n===r}function v(e){return g(e)??``}function y(e){return g(e)??`—`}var b={query:``,topics:[],language:``,sort:`title`,page:1};function x(e){let t=e.topics.join(` `),n=g(e.language);return[e.id,e.title,e.summary,e.channelUrl,e.language,n,t,e.siteKey].filter(Boolean).join(` `)}function ee(e,t){if(!t)return!0;let n=e.toLowerCase(),r=t.toLowerCase(),i=0,a=0;for(;a<r.length&&i<n.length;)r[a]===n[i]&&(a+=1),i+=1;return a===r.length}function S(e){let t=new Set,n=new Set;for(let r of e){for(let e of r.topics)t.add(e);if(r.language){let e=g(r.language);e&&n.add(e)}}return{topics:[...t].sort((e,t)=>e.localeCompare(t)),languages:[...n].sort((e,t)=>e.localeCompare(t))}}function te(e,t){let n=t.query.trim().toLowerCase();return e.filter(e=>{let r=x(e).toLowerCase();return!(n&&!ee(r,n)||t.topics.length>0&&!t.topics.some(t=>e.topics.includes(t))||t.language&&!_(e.language,t.language))})}function ne(e,t){let n=[...e];return n.sort((e,n)=>t===`site`?e.siteKey.localeCompare(n.siteKey):e.title.localeCompare(n.title)),n}function re(e,t,n=25){let r=e.length,i=Math.max(1,Math.ceil(r/n)),a=(Math.min(Math.max(t,1),i)-1)*n;return{items:e.slice(a,a+n),totalPages:i,total:r}}function ie(e){return!!e.query.trim()||e.topics.length>0||!!e.language||e.page>1}var C=[`title`,`site`];function w(e){return C.includes(e)?e:b.sort}function T(){let e=new URLSearchParams(window.location.search),t=Number.parseInt(e.get(`page`)??`1`,10);return{query:e.get(`q`)??``,topics:e.getAll(`topic`).filter(Boolean),language:v(e.get(`lang`)??``),sort:w(e.get(`sort`)),page:Number.isFinite(t)&&t>0?t:1}}function E(e){let t=new URLSearchParams,n=e.query.trim();n&&t.set(`q`,n);for(let n of e.topics)t.append(`topic`,n);e.language&&t.set(`lang`,v(e.language)),e.sort!==b.sort&&t.set(`sort`,e.sort),e.page>1&&t.set(`page`,String(e.page));let r=t.toString(),i=r?`${window.location.pathname}?${r}`:window.location.pathname;window.history.replaceState({},``,i)}function D(e){return{...b,sort:e.sort}}var O=`https://1.h2r.workers.dev/`,k=`html2rss.feedDirectory.instanceUrl`;function A(){let e=window.location.hash||``;return e.startsWith(`#!`)?new URLSearchParams(e.slice(2)):new URLSearchParams}function j(e){return e.protocol!==`http:`&&e.protocol!==`https:`?null:(e.search=``,e.hash=``,e.toString())}function M(){return O}function N(e){let t=e.trim();if(!t)return null;try{return j(new URL(t))}catch{return null}}function P(e=M()){let t=A().get(`url`);if(t)try{let n=j(new URL(t));if(n)return F(n,e),n}catch{}try{let e=window.localStorage.getItem(k);if(e){let t=N(e);if(t)return t}}catch{}return e}function F(e,t=M()){try{e&&e!==t?window.localStorage.setItem(k,e):window.localStorage.removeItem(k)}catch{}if(window.location.hash.startsWith(`#!`)){let e=`${window.location.pathname}${window.location.search}`;window.history.replaceState({},``,e)}}function I(e,t=`html2rss-feeds.opml`){let n=new Blob([e],{type:`text/x-opml+xml`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=t,document.body.appendChild(i),i.click(),i.remove(),URL.revokeObjectURL(r)}function L(e,t,n={}){let r=new URL(t.path,e);for(let[e,t]of Object.entries(n))t&&r.searchParams.set(e,t);return r.toString()}function R(e){try{let t=new URL(e);return t.host+t.pathname.replace(/\/$/,``)}catch{return e}}function z(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`)}function B(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&apos;`)}function V(e,t,n){return`<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>html2rss feeds</title>
  </head>
  <body>
${t.map(t=>{let r=L(e,t,n[t.id]??{}),i=t.channelUrl?` htmlUrl="${B(t.channelUrl)}"`:``;return`    <outline type="rss" text="${B(t.title)}" title="${B(t.title)}" xmlUrl="${B(r)}"${i} />`}).join(`
`)}
  </body>
</opml>
`}function H(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e.apply(this,r),t)}}function U(e,t){return e.topics.length===0?`<p class="fd-muted fd-empty-hint">Topics appear after the catalog loads.</p>`:e.topics.map(e=>{let n=t.includes(e);return`<button type="button" class="fd-chip${n?` is-active`:``}" data-action="toggle-topic" data-topic="${z(e)}" aria-pressed="${n}">${z(e)}</button>`}).join(``)}function W(e,t){let n=v(t),r=e.languages.map(e=>`<option value="${z(e)}"${e===n?` selected`:``}>${z(e)}</option>`).join(``);return`<option value=""${n?``:` selected`}>All languages</option>${r}`}function G(e,t){let n=Object.keys(e.parameterSchema);return n.length===0?``:`<div class="fd-params">${n.map(n=>{let r=t[n]??e.parameterDefaults[n]??``;return`<label class="fd-field">
        <span class="fd-field-label">${z(n)}</span>
        <input class="fd-input" type="text" data-param-key="${z(n)}" data-entry-id="${z(e.id)}" value="${z(String(r))}" />
      </label>`}).join(``)}</div>`}function K(e,t){let n=y(e.language),r=t.parametersById[e.id]??{},i=L(t.instanceUrl,e,r),a=Object.keys(e.parameterSchema).length>0,o=t.expandedEntryId===e.id,s=t.copiedEntryId===e.id,c=e.topics.length>0?e.topics.map(e=>`<span class="fd-badge">${z(e)}</span>`).join(``):``,l=e.channelUrl?`<a class="fd-domain fd-domain-link" href="${z(e.channelUrl)}" target="_blank" rel="noopener noreferrer nofollow">${z(e.siteKey)}</a>`:`<code class="fd-domain">${z(e.siteKey)}</code>`;return`<tr class="fd-row" data-entry-id="${z(e.id)}">
    <td class="fd-cell-feed">
      <article class="fd-feed-card">
        <h3 class="fd-feed-title">${z(e.title)}</h3>
        ${e.summary?`<p class="fd-feed-summary">${z(e.summary)}</p>`:``}
        <div class="fd-feed-meta">
          ${l}
          ${n===`—`?``:`<span class="fd-lang">${z(n)}</span>`}
          ${c}
        </div>
      </article>
    </td>
    <td class="fd-cell-actions">
      <div class="fd-action-bar">
        <a class="fd-btn fd-btn-primary fd-btn-compact" href="${z(i)}" target="_blank" rel="noopener noreferrer nofollow">RSS</a>
        <button type="button" class="fd-btn fd-btn-ghost fd-btn-compact" data-action="copy-feed" data-entry-id="${z(e.id)}" aria-label="Copy RSS link">${s?`Copied`:`Copy`}</button>
        ${e.channelUrl?`<a class="fd-btn fd-btn-ghost fd-btn-compact" href="${z(e.channelUrl)}" target="_blank" rel="noopener noreferrer nofollow">Source</a>`:``}
        ${a?`<button type="button" class="fd-btn fd-btn-ghost fd-btn-compact" data-action="toggle-params" data-entry-id="${z(e.id)}" aria-expanded="${o}">${o?`Hide`:`Params`}</button>`:``}
      </div>
    </td>
  </tr>
  ${o&&a?`<tr class="fd-row fd-row-detail">
      <td colspan="2">
        <div class="fd-detail">
          <p class="fd-detail-title">Customize feed parameters</p>
          ${G(e,r)}
        </div>
      </td>
    </tr>`:``}`}function q(e){if(e.filteredTotal<=25)return``;let t=e.filters.page<=1,n=e.filters.page>=e.totalPages;return`<nav class="fd-pagination" aria-label="Feed list pages">
    <button type="button" class="fd-btn fd-btn-ghost" data-action="page-prev" ${t?`disabled`:``}>Previous</button>
    <span class="fd-pagination-label">Page ${e.filters.page} of ${e.totalPages}</span>
    <button type="button" class="fd-btn fd-btn-ghost" data-action="page-next" ${n?`disabled`:``}>Next</button>
  </nav>`}function J(e){return e.loadState===`loading`?`<div class="fd-loading" aria-live="polite">
      <div class="fd-skeleton fd-skeleton-toolbar"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <p class="fd-muted">Loading feeds from the instance catalog…</p>
    </div>`:e.loadState===`error`&&e.error?`<div class="fd-banner fd-banner-error" role="alert">${z(e.error.message)}</div>`:e.loadState===`ready`?e.catalogEntryCount===0?`<div class="fd-empty">
      <p class="fd-empty-title">No feeds in this catalog</p>
      <p class="fd-muted">Try another instance or contribute a configuration.</p>
    </div>`:e.filteredTotal===0?`<div class="fd-empty">
      <p class="fd-empty-title">No feeds match your filters</p>
      <p class="fd-muted">Try clearing search text, topics, or language filters.</p>
      <button type="button" class="fd-btn fd-btn-ghost" data-action="clear-filters">Clear filters</button>
    </div>`:`<div class="fd-table-wrap">
    <table class="fd-table">
      <colgroup>
        <col class="fd-col-feed" />
        <col class="fd-col-actions" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Feed</th>
          <th scope="col" class="fd-col-actions-heading"><span class="fd-sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>${e.pageItems.map(t=>K(t,e)).join(``)}</tbody>
    </table>
  </div>
  ${q(e)}`:``}function Y(e){let t=ie(e.filters),n=t?`${e.filteredTotal} matching feed${e.filteredTotal===1?``:`s`}`:`${e.catalogTotal} ready-to-use feed${e.catalogTotal===1?``:`s`}`,r=e.instanceFeedback,i=r?.tone?` fd-feedback-${r.tone}`:``;return`<div class="fd-shell">
    <header class="fd-header">
      <div class="fd-header-copy">
        <p class="fd-eyebrow">Feed Directory</p>
        <p class="fd-lead">${z(n)} from <strong>${z(R(e.instanceUrl))}</strong></p>
      </div>
      <div class="fd-header-actions">
        <button type="button" class="fd-btn fd-btn-ghost" data-action="toggle-instance" aria-expanded="${e.instanceEditorOpen}">${e.instanceEditorOpen?`Close instance`:`Change instance`}</button>
        <button type="button" class="fd-btn fd-btn-ghost" data-action="export-opml" ${e.filteredTotal===0?`disabled`:``}>Export OPML</button>
      </div>
    </header>

    ${e.instanceEditorOpen?`<section class="fd-panel" aria-label="Instance settings">
      <label class="fd-field">
        <span class="fd-field-label">Instance URL</span>
        <div class="fd-inline-field">
          <input class="fd-input" type="url" inputmode="url" spellcheck="false" data-ref="instance-draft" value="${z(e.instanceDraft)}" placeholder="https://your-instance.example" />
          <button type="button" class="fd-btn fd-btn-primary" data-action="apply-instance">Apply</button>
        </div>
      </label>
      <p class="fd-feedback${i}">${z(r?.message??`Feed links update when you apply a valid instance URL.`)}</p>
    </section>`:``}

    <section class="fd-panel fd-toolbar" aria-label="Search and filters">
      <label>
        <span class="fd-sr-only">Search feeds</span>
        <input class="fd-input fd-search-input" type="search" data-ref="search" value="${z(e.filters.query)}" placeholder="Search by feed name, site, or domain" enterkeyhint="search" />
      </label>

      <div class="fd-filter-block">
        <div class="fd-filter-group">
          <span class="fd-field-label">Topics</span>
          <div class="fd-chip-row" role="group" aria-label="Filter by topic">${U(e.facets,e.filters.topics)}</div>
        </div>

        <div class="fd-filter-row">
          <label class="fd-field fd-field-inline">
            <span class="fd-field-label">Language</span>
            <select class="fd-select" data-ref="language">${W(e.facets,e.filters.language)}</select>
          </label>

          <label class="fd-field fd-field-inline">
            <span class="fd-field-label">Sort</span>
            <select class="fd-select" data-ref="sort">
              <option value="title"${e.filters.sort===`title`?` selected`:``}>Title A–Z</option>
              <option value="site"${e.filters.sort===`site`?` selected`:``}>Site A–Z</option>
            </select>
          </label>

          ${t?`<button type="button" class="fd-btn fd-btn-ghost" data-action="clear-filters">Clear filters</button>`:``}
        </div>
      </div>
    </section>

    ${J(e)}
  </div>`}function ae(e,t){return{loadState:`idle`,entries:[],facets:{topics:[],languages:[]},catalogTotal:0,filters:e,instanceUrl:t,instanceDraft:t,instanceEditorOpen:!1,instanceFeedback:null,expandedEntryId:null,parametersById:{},copiedEntryId:null,error:null}}function X(e,t){return{...e,filters:{...e.filters,...t}}}function Z(e){let t=ne(te(e.entries,e.filters),e.filters.sort),{items:n,totalPages:r,total:i}=re(t,e.filters.page);return{filteredEntries:t,pageItems:n,filteredTotal:i,totalPages:r,filters:{...e.filters,page:Math.min(Math.max(e.filters.page,1),r)}}}function oe(e){return{...e,expandedEntryId:null,parametersById:{}}}function se(e,t,n){return{...oe(e),loadState:`ready`,entries:t,catalogTotal:n,facets:S(t),error:null}}function ce(e,t){return{...e,loadState:`error`,error:t,entries:[],facets:{topics:[],languages:[]},catalogTotal:0}}function le(e,t){return{...e,filters:{...b,...t}}}function ue(e,t){return{loadState:e.loadState,error:e.error,instanceUrl:e.instanceUrl,instanceEditorOpen:e.instanceEditorOpen,instanceDraft:e.instanceDraft,instanceFeedback:e.instanceFeedback,filters:t.filters,facets:e.facets,catalogTotal:e.catalogTotal,catalogEntryCount:e.entries.length,filteredTotal:t.filteredTotal,pageItems:t.pageItems,totalPages:t.totalPages,expandedEntryId:e.expandedEntryId,parametersById:e.parametersById,copiedEntryId:e.copiedEntryId}}var Q=class{root;state;debouncedSearch=H(e=>{this.patchFilters({query:e,page:1})},180);constructor(e){this.root=e,this.state=ae(T(),P(M()))}start(){this.root.addEventListener(`click`,e=>this.onClick(e)),this.root.addEventListener(`input`,e=>this.onInput(e)),this.root.addEventListener(`change`,e=>this.onChange(e)),this.render(),this.loadCatalog()}async loadCatalog(e=this.state.instanceUrl){this.state={...this.state,loadState:`loading`,error:null},this.render();try{let{entries:t,meta:n}=await m(e);this.state=se({...this.state,instanceUrl:e,instanceDraft:e},t,n.total)}catch(e){this.state=ce(this.state,h(e))}this.render()}patchFilters(e){this.state=X(this.state,e),E(this.state.filters),this.render()}currentPagedSelection(){let e=Z(this.state);return e.filters.page!==this.state.filters.page&&(this.state=X(this.state,{page:e.filters.page}),E(this.state.filters)),Z(this.state)}render(){let e=this.currentPagedSelection();this.root.innerHTML=Y(ue(this.state,e)),this.syncRefs()}syncRefs(){let e=this.root.querySelector(`[data-ref="search"]`);e&&e.value!==this.state.filters.query&&(e.value=this.state.filters.query)}onInput(e){let t=e.target;if(!(t instanceof HTMLInputElement))return;if(t.dataset.ref===`search`){this.debouncedSearch(t.value);return}let n=t.dataset.entryId,r=t.dataset.paramKey;if(n&&r){let e={...this.state.parametersById[n]??{},[r]:t.value};this.state={...this.state,parametersById:{...this.state.parametersById,[n]:e}},this.render()}t.dataset.ref===`instance-draft`&&(this.state={...this.state,instanceDraft:t.value})}onChange(e){let t=e.target;if(t instanceof HTMLSelectElement){if(t.dataset.ref===`language`){this.patchFilters({language:v(t.value),page:1});return}t.dataset.ref===`sort`&&this.patchFilters({sort:t.value,page:1})}}onClick(e){let t=e.target;if(!(t instanceof Element))return;let n=t.closest(`[data-action]`);if(!n)return;let r=n.dataset.action;if(r)switch(r){case`toggle-topic`:{let e=n.dataset.topic;if(!e)return;let t=new Set(this.state.filters.topics);t.has(e)?t.delete(e):t.add(e),this.patchFilters({topics:[...t],page:1});break}case`clear-filters`:this.patchFilters(D(this.state.filters));break;case`page-prev`:this.state.filters.page>1&&this.patchFilters({page:this.state.filters.page-1});break;case`page-next`:this.patchFilters({page:this.state.filters.page+1});break;case`toggle-instance`:this.state={...this.state,instanceEditorOpen:!this.state.instanceEditorOpen,instanceFeedback:null},this.render();break;case`apply-instance`:this.applyInstance();break;case`toggle-params`:{let e=n.dataset.entryId;if(!e)return;this.state={...this.state,expandedEntryId:this.state.expandedEntryId===e?null:e},this.render();break}case`copy-feed`:this.copyFeed(n.dataset.entryId);break;case`export-opml`:this.exportOpml();break;default:break}}async applyInstance(){let e=N(this.state.instanceDraft);if(!e){this.state={...this.state,instanceFeedback:{message:`Enter a valid http(s) URL.`,tone:`error`}},this.render();return}F(e,M()),this.state=le({...this.state,instanceEditorOpen:!1,instanceFeedback:{message:`Using your custom instance.`,tone:`success`}},T()),await this.loadCatalog(e)}async copyFeed(e){if(!e)return;let t=this.state.entries.find(t=>t.id===e);if(!t)return;let n=L(this.state.instanceUrl,t,this.state.parametersById[e]??{});try{await navigator.clipboard.writeText(n),this.state={...this.state,copiedEntryId:e},this.render(),window.setTimeout(()=>{this.state={...this.state,copiedEntryId:null},this.render()},1400)}catch{this.state={...this.state,instanceFeedback:{message:`Could not copy link.`,tone:`error`}},this.render()}}exportOpml(){let{filteredEntries:e}=Z(this.state);e.length!==0&&I(V(this.state.instanceUrl,e,this.state.parametersById))}},$=document.getElementById(`feed-directory-app`);$&&new Q($).start();