function e(e){let t=e.indexOf(`/`);return t===-1?e:e.slice(0,t)}var t=new Set([`ok`,`empty`,`error`,`unknown`]);function n(e){switch(e){case`ok`:return 0;case`unknown`:return 1;case`empty`:return 2;case`error`:return 3}}function r(e){return e.state===`empty`||e.state===`error`}function i(e){return typeof e==`string`&&t.has(e)}var a=[2],o=class extends Error{constructor(e=`Catalog is disabled on this instance.`){super(e),this.name=`CatalogDisabledError`}},s=class extends Error{constructor(e=`Could not reach the instance catalog.`){super(e),this.name=`CatalogNetworkError`}},c=class extends Error{constructor(e=`The instance returned an invalid catalog response.`){super(e),this.name=`CatalogInvalidEnvelopeError`}},l=class extends Error{constructor(e=`This instance returned an unsupported catalog version.`){super(e),this.name=`CatalogUnsupportedVersionError`}};function u(e){return typeof e==`object`&&!!e}function d(e){return typeof e==`string`&&e.trim()?e:void 0}function f(e){return Array.isArray(e)?e.filter(e=>typeof e==`string`&&e.trim().length>0):[]}function ee(e){if(!u(e))return{};let t={};for(let[n,r]of Object.entries(e)){if(!u(r))continue;let e=d(r.type);e&&(t[n]={type:e})}return t}function p(e){if(!u(e))return{};let t={};for(let[n,r]of Object.entries(e))typeof r==`string`&&(t[n]=r);return t}function m(e){if(!u(e)||!i(e.state))return null;let t=e.code;if(!(t===null||typeof t==`string`))return null;let n=e.at;return n===null||typeof n==`string`?{state:e.state,code:t===null||t.trim()===``?null:t,at:n===null||n.trim()===``?null:n}:null}function h(t){if(!Array.isArray(t))return[];let n=[];for(let r of t){if(!u(r))continue;let t=r,i=d(t.id),a=d(t.path),o=d(t.channel?.url),s=m(t.last_result);!i||!a||!o||!s||n.push({id:i,path:a,siteKey:e(i),title:d(t.directory?.title)??i,summary:d(t.directory?.summary)??``,topics:f(t.directory?.topics),channelUrl:o,language:d(t.channel?.language)??``,parameterSchema:ee(t.parameters?.schema),parameterDefaults:p(t.parameters?.defaults),lastResult:s})}return n}function g(e){let t=e?.catalog_version;if(typeof t!=`number`||!Number.isFinite(t))throw new c;if(!a.includes(t))throw new l;return t}function _(e){if(!u(e))throw new c;let t=e;if(t.success!==!0||!u(t.data))throw new c;let n=h(t.data.configs),r=g(t.meta),i=t.meta?.total;return{entries:n,meta:{total:typeof i==`number`&&Number.isFinite(i)?i:n.length,catalogVersion:r,starters:f(t.meta?.starters)}}}async function v(e,t=fetch){let n=new URL(`/api/v1/configs`,e).toString(),r;try{r=await t(n,{headers:{Accept:`application/json`}})}catch{throw new s}if(r.status===404)throw new o;if(!r.ok)throw new s(`Catalog request failed with status ${r.status}.`);let i;try{i=await r.json()}catch{throw new c}return _(i)}function y(e){return e instanceof o?{kind:`disabled`,message:`This instance has the feed catalog disabled.`}:e instanceof l?{kind:`unsupported_version`,message:`This instance returned an unsupported catalog version.`}:e instanceof c?{kind:`invalid`,message:`The instance returned an unexpected catalog response.`}:e instanceof s?{kind:`network`,message:`Could not load the feed catalog from this instance.`}:{kind:`unknown`,message:`Could not load the feed catalog.`}}function b(e){if(!e)return null;let t=e.trim();return t&&t.split(/[-_]/)[0]?.toLowerCase()||null}function te(e,t){if(!t)return!0;let n=b(e),r=b(t);return n!==null&&r!==null&&n===r}function x(e){return b(e)??``}function S(e){return b(e)??`—`}var C={query:``,topics:[],language:``,sort:`title`,page:1};function w(e){let t=e.topics.join(` `),n=b(e.language);return[e.id,e.title,e.summary,e.channelUrl,e.language,n,t,e.siteKey].filter(Boolean).join(` `)}function T(e,t){if(!t)return!0;let n=e.toLowerCase(),r=t.toLowerCase(),i=0,a=0;for(;a<r.length&&i<n.length;)r[a]===n[i]&&(a+=1),i+=1;return a===r.length}function E(e){let t=new Set,n=new Set;for(let r of e){for(let e of r.topics)t.add(e);if(r.language){let e=b(r.language);e&&n.add(e)}}return{topics:[...t].sort((e,t)=>e.localeCompare(t)),languages:[...n].sort((e,t)=>e.localeCompare(t))}}function ne(e,t){let n=t.query.trim().toLowerCase();return e.filter(e=>{let r=w(e).toLowerCase();return!(n&&!T(r,n)||t.topics.length>0&&!t.topics.some(t=>e.topics.includes(t))||t.language&&!te(e.language,t.language))})}function re(e,t){let r=[...e];return r.sort((e,r)=>{let i=n(e.lastResult.state)-n(r.lastResult.state);return i===0?t===`site`?e.siteKey.localeCompare(r.siteKey):e.title.localeCompare(r.title):i}),r}function D(e,t,n=25){let r=e.length,i=Math.max(1,Math.ceil(r/n)),a=(Math.min(Math.max(t,1),i)-1)*n;return{items:e.slice(a,a+n),totalPages:i,total:r}}function O(e){return!!e.query.trim()||e.topics.length>0||!!e.language||e.page>1}var k=[`title`,`site`];function A(e){return k.includes(e)?e:C.sort}function j(){let e=new URLSearchParams(window.location.search),t=Number.parseInt(e.get(`page`)??`1`,10);return{query:e.get(`q`)??``,topics:e.getAll(`topic`).filter(Boolean),language:x(e.get(`lang`)??``),sort:A(e.get(`sort`)),page:Number.isFinite(t)&&t>0?t:1}}function M(e){let t=new URLSearchParams,n=e.query.trim();n&&t.set(`q`,n);for(let n of e.topics)t.append(`topic`,n);e.language&&t.set(`lang`,x(e.language)),e.sort!==C.sort&&t.set(`sort`,e.sort),e.page>1&&t.set(`page`,String(e.page));let r=t.toString(),i=r?`${window.location.pathname}?${r}`:window.location.pathname;window.history.replaceState({},``,i)}function N(e){return{...C,sort:e.sort}}var P=`https://1.h2r.workers.dev/`,F=`html2rss.feedDirectory.instanceUrl`;function I(){let e=window.location.hash||``;return e.startsWith(`#!`)?new URLSearchParams(e.slice(2)):new URLSearchParams}function L(e){return e.protocol!==`http:`&&e.protocol!==`https:`?null:(e.search=``,e.hash=``,e.toString())}function R(){return P}function z(e){let t=e.trim();if(!t)return null;try{return L(new URL(t))}catch{return null}}function B(e=R()){let t=I().get(`url`);if(t)try{let n=L(new URL(t));if(n)return V(n,e),n}catch{}try{let e=window.localStorage.getItem(F);if(e){let t=z(e);if(t)return t}}catch{}return e}function V(e,t=R()){try{e&&e!==t?window.localStorage.setItem(F,e):window.localStorage.removeItem(F)}catch{}if(window.location.hash.startsWith(`#!`)){let e=`${window.location.pathname}${window.location.search}`;window.history.replaceState({},``,e)}}function H(e,t=`html2rss-feeds.opml`){let n=new Blob([e],{type:`text/x-opml+xml`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=t,document.body.appendChild(i),i.click(),i.remove(),URL.revokeObjectURL(r)}function U(e,t,n={}){let r=new URL(t.path,e);for(let[e,t]of Object.entries(n))t&&r.searchParams.set(e,t);return r.toString()}function W(e){try{let t=new URL(e);return t.host+t.pathname.replace(/\/$/,``)}catch{return e}}function G(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`)}function K(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&apos;`)}function q(e,t,n){return`<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>html2rss feeds</title>
  </head>
  <body>
${t.map(t=>{let r=U(e,t,n[t.id]??{}),i=t.channelUrl?` htmlUrl="${K(t.channelUrl)}"`:``;return`    <outline type="rss" text="${K(t.title)}" title="${K(t.title)}" xmlUrl="${K(r)}"${i} />`}).join(`
`)}
  </body>
</opml>
`}function J(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e.apply(this,r),t)}}function Y(e){switch(e.state){case`ok`:return`<span class="fd-result fd-result-ok" title="Last known scrape on this instance succeeded">Last scrape ok</span>`;case`empty`:return`<span class="fd-result fd-result-empty" title="Last known scrape on this instance returned no items">Last scrape empty</span>`;case`error`:return`<span class="fd-result fd-result-error" title="Last known scrape on this instance failed">Last scrape failed</span>`;case`unknown`:return``}}function X(e,t){return e.topics.length===0?`<p class="fd-muted fd-empty-hint">Topics appear after the catalog loads.</p>`:e.topics.map(e=>{let n=t.includes(e);return`<button type="button" class="fd-chip${n?` is-active`:``}" data-action="toggle-topic" data-topic="${G(e)}" aria-pressed="${n}">${G(e)}</button>`}).join(``)}function ie(e,t){let n=x(t),r=e.languages.map(e=>`<option value="${G(e)}"${e===n?` selected`:``}>${G(e)}</option>`).join(``);return`<option value=""${n?``:` selected`}>All languages</option>${r}`}function ae(e,t){let n=Object.keys(e.parameterSchema);return n.length===0?``:`<div class="fd-params">${n.map(n=>{let r=t[n]??e.parameterDefaults[n]??``;return`<label class="fd-field">
        <span class="fd-field-label">${G(n)}</span>
        <input class="fd-input" type="text" data-param-key="${G(n)}" data-entry-id="${G(e.id)}" value="${G(String(r))}" />
      </label>`}).join(``)}</div>`}function oe(e,t){let n=S(e.language),i=t.parametersById[e.id]??{},a=U(t.instanceUrl,e,i),o=Object.keys(e.parameterSchema).length>0,s=t.expandedEntryId===e.id,c=t.copiedEntryId===e.id,l=r(e.lastResult),u=Y(e.lastResult),d=e.topics.length>0?e.topics.map(e=>`<span class="fd-badge">${G(e)}</span>`).join(``):``,f=e.channelUrl?`<a class="fd-domain fd-domain-link" href="${G(e.channelUrl)}" target="_blank" rel="noopener noreferrer nofollow">${G(e.siteKey)}</a>`:`<code class="fd-domain">${G(e.siteKey)}</code>`;return`<tr class="fd-row${l?` fd-row-failing`:``}" data-entry-id="${G(e.id)}">
    <td class="fd-cell-feed">
      <article class="fd-feed-card">
        <h3 class="fd-feed-title">${G(e.title)}</h3>
        ${e.summary?`<p class="fd-feed-summary">${G(e.summary)}</p>`:``}
        <div class="fd-feed-meta">
          ${f}
          ${n===`—`?``:`<span class="fd-lang">${G(n)}</span>`}
          ${d}
          ${u}
        </div>
      </article>
    </td>
    <td class="fd-cell-actions">
      <div class="fd-action-bar">
        <a class="fd-btn fd-btn-primary fd-btn-compact" href="${G(a)}" target="_blank" rel="noopener noreferrer nofollow" data-action="open-feed" data-entry-id="${G(e.id)}">RSS</a>
        <button type="button" class="fd-btn fd-btn-ghost fd-btn-compact" data-action="copy-feed" data-entry-id="${G(e.id)}" aria-label="Copy RSS link">${c?`Copied`:`Copy`}</button>
        ${e.channelUrl?`<a class="fd-btn fd-btn-ghost fd-btn-compact" href="${G(e.channelUrl)}" target="_blank" rel="noopener noreferrer nofollow">Source</a>`:``}
        ${o?`<button type="button" class="fd-btn fd-btn-ghost fd-btn-compact" data-action="toggle-params" data-entry-id="${G(e.id)}" aria-expanded="${s}">${s?`Hide`:`Params`}</button>`:``}
      </div>
    </td>
  </tr>
  ${s&&o?`<tr class="fd-row fd-row-detail">
      <td colspan="2">
        <div class="fd-detail">
          <p class="fd-detail-title">Customize feed parameters</p>
          ${ae(e,i)}
        </div>
      </td>
    </tr>`:``}`}function se(e){if(e.filteredTotal<=25)return``;let t=e.filters.page<=1,n=e.filters.page>=e.totalPages;return`<nav class="fd-pagination" aria-label="Feed list pages">
    <button type="button" class="fd-btn fd-btn-ghost" data-action="page-prev" ${t?`disabled`:``}>Previous</button>
    <span class="fd-pagination-label">Page ${e.filters.page} of ${e.totalPages}</span>
    <button type="button" class="fd-btn fd-btn-ghost" data-action="page-next" ${n?`disabled`:``}>Next</button>
  </nav>`}function ce(e){return e.loadState===`loading`?`<div class="fd-loading" aria-live="polite">
      <div class="fd-skeleton fd-skeleton-toolbar"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <p class="fd-muted">Loading feeds from the instance catalog…</p>
    </div>`:e.loadState===`error`&&e.error?`<div class="fd-banner fd-banner-error" role="alert">${G(e.error.message)}</div>`:e.loadState===`ready`?e.catalogEntryCount===0?`<div class="fd-empty">
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
      <tbody>${e.pageItems.map(t=>oe(t,e)).join(``)}</tbody>
    </table>
  </div>
  ${se(e)}`:``}function le(e){let t=O(e.filters),n=t?`${e.filteredTotal} matching feed${e.filteredTotal===1?``:`s`}`:`${e.catalogTotal} feed${e.catalogTotal===1?``:`s`}`,r=e.instanceFeedback,i=r?.tone?` fd-feedback-${r.tone}`:``;return`<div class="fd-shell">
    <header class="fd-header">
      <div class="fd-header-copy">
        <p class="fd-eyebrow">Feed Directory</p>
        <p class="fd-lead">${G(n)} from <strong>${G(W(e.instanceUrl))}</strong></p>
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
          <input class="fd-input" type="url" inputmode="url" spellcheck="false" data-ref="instance-draft" value="${G(e.instanceDraft)}" placeholder="https://your-instance.example" />
          <button type="button" class="fd-btn fd-btn-primary" data-action="apply-instance">Apply</button>
        </div>
      </label>
      <p class="fd-feedback${i}">${G(r?.message??`Feed links update when you apply a valid instance URL.`)}</p>
    </section>`:``}

    <section class="fd-panel fd-toolbar" aria-label="Search and filters">
      <label>
        <span class="fd-sr-only">Search feeds</span>
        <input class="fd-input fd-search-input" type="search" data-ref="search" value="${G(e.filters.query)}" placeholder="Search by feed name, site, or domain" enterkeyhint="search" />
      </label>

      <div class="fd-filter-block">
        <div class="fd-filter-group">
          <span class="fd-field-label">Topics</span>
          <div class="fd-chip-row" role="group" aria-label="Filter by topic">${X(e.facets,e.filters.topics)}</div>
        </div>

        <div class="fd-filter-row">
          <label class="fd-field fd-field-inline">
            <span class="fd-field-label">Language</span>
            <select class="fd-select" data-ref="language">${ie(e.facets,e.filters.language)}</select>
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

    ${ce(e)}
  </div>`}function ue(e,t){return{loadState:`idle`,entries:[],facets:{topics:[],languages:[]},catalogTotal:0,filters:e,instanceUrl:t,instanceDraft:t,instanceEditorOpen:!1,instanceFeedback:null,expandedEntryId:null,parametersById:{},copiedEntryId:null,error:null}}function Z(e,t){return{...e,filters:{...e.filters,...t}}}function Q(e){let t=re(ne(e.entries,e.filters),e.filters.sort),{items:n,totalPages:r,total:i}=D(t,e.filters.page);return{filteredEntries:t,pageItems:n,filteredTotal:i,totalPages:r,filters:{...e.filters,page:Math.min(Math.max(e.filters.page,1),r)}}}function de(e){return{...e,expandedEntryId:null,parametersById:{}}}function fe(e,t,n){return{...de(e),loadState:`ready`,entries:t,catalogTotal:n,facets:E(t),error:null}}function pe(e,t){return{...e,loadState:`error`,error:t,entries:[],facets:{topics:[],languages:[]},catalogTotal:0}}function me(e,t){return{...e,filters:{...C,...t}}}function he(e,t){return{loadState:e.loadState,error:e.error,instanceUrl:e.instanceUrl,instanceEditorOpen:e.instanceEditorOpen,instanceDraft:e.instanceDraft,instanceFeedback:e.instanceFeedback,filters:t.filters,facets:e.facets,catalogTotal:e.catalogTotal,catalogEntryCount:e.entries.length,filteredTotal:t.filteredTotal,pageItems:t.pageItems,totalPages:t.totalPages,expandedEntryId:e.expandedEntryId,parametersById:e.parametersById,copiedEntryId:e.copiedEntryId}}var ge=class{root;state;debouncedSearch=J(e=>{this.patchFilters({query:e,page:1})},180);constructor(e){this.root=e,this.state=ue(j(),B(R()))}start(){this.root.addEventListener(`click`,e=>this.onClick(e)),this.root.addEventListener(`input`,e=>this.onInput(e)),this.root.addEventListener(`change`,e=>this.onChange(e)),this.render(),this.loadCatalog()}async loadCatalog(e=this.state.instanceUrl){this.state={...this.state,loadState:`loading`,error:null},this.render();try{let{entries:t,meta:n}=await v(e);this.state=fe({...this.state,instanceUrl:e,instanceDraft:e},t,n.total)}catch(e){this.state=pe(this.state,y(e))}this.render()}patchFilters(e){this.state=Z(this.state,e),M(this.state.filters),this.render()}currentPagedSelection(){let e=Q(this.state);return e.filters.page!==this.state.filters.page&&(this.state=Z(this.state,{page:e.filters.page}),M(this.state.filters)),Q(this.state)}render(){let e=this.currentPagedSelection();this.root.innerHTML=le(he(this.state,e)),this.syncRefs()}syncRefs(){let e=this.root.querySelector(`[data-ref="search"]`);e&&e.value!==this.state.filters.query&&(e.value=this.state.filters.query)}onInput(e){let t=e.target;if(!(t instanceof HTMLInputElement))return;if(t.dataset.ref===`search`){this.debouncedSearch(t.value);return}let n=t.dataset.entryId,r=t.dataset.paramKey;if(n&&r){let e={...this.state.parametersById[n]??{},[r]:t.value};this.state={...this.state,parametersById:{...this.state.parametersById,[n]:e}},this.render()}t.dataset.ref===`instance-draft`&&(this.state={...this.state,instanceDraft:t.value})}onChange(e){let t=e.target;if(t instanceof HTMLSelectElement){if(t.dataset.ref===`language`){this.patchFilters({language:x(t.value),page:1});return}t.dataset.ref===`sort`&&this.patchFilters({sort:t.value,page:1})}}onClick(e){let t=e.target;if(!(t instanceof Element))return;let n=t.closest(`[data-action]`);if(!n)return;let i=n.dataset.action;if(i)switch(i){case`toggle-topic`:{let e=n.dataset.topic;if(!e)return;let t=new Set(this.state.filters.topics);t.has(e)?t.delete(e):t.add(e),this.patchFilters({topics:[...t],page:1});break}case`clear-filters`:this.patchFilters(N(this.state.filters));break;case`page-prev`:this.state.filters.page>1&&this.patchFilters({page:this.state.filters.page-1});break;case`page-next`:this.patchFilters({page:this.state.filters.page+1});break;case`toggle-instance`:this.state={...this.state,instanceEditorOpen:!this.state.instanceEditorOpen,instanceFeedback:null},this.render();break;case`apply-instance`:this.applyInstance();break;case`toggle-params`:{let e=n.dataset.entryId;if(!e)return;this.state={...this.state,expandedEntryId:this.state.expandedEntryId===e?null:e},this.render();break}case`open-feed`:{let t=n.dataset.entryId,i=this.findEntry(t);if(!i)return;r(i.lastResult)&&!this.confirmFailingSubscribe(i)&&e.preventDefault();break}case`copy-feed`:this.copyFeed(n.dataset.entryId);break;case`export-opml`:this.exportOpml();break;default:break}}findEntry(e){if(e)return this.state.entries.find(t=>t.id===e)}confirmFailingSubscribe(e){let t=e.lastResult.state===`empty`?`The last known scrape on this instance returned no items.`:`The last known scrape on this instance failed.`;return window.confirm(`${t} Feeds that recently failed often fail again. Subscribe anyway?`)}async applyInstance(){let e=z(this.state.instanceDraft);if(!e){this.state={...this.state,instanceFeedback:{message:`Enter a valid http(s) URL.`,tone:`error`}},this.render();return}V(e,R()),this.state=me({...this.state,instanceEditorOpen:!1,instanceFeedback:{message:`Using your custom instance.`,tone:`success`}},j()),await this.loadCatalog(e)}async copyFeed(e){let t=this.findEntry(e);if(!t||!e||r(t.lastResult)&&!this.confirmFailingSubscribe(t))return;let n=U(this.state.instanceUrl,t,this.state.parametersById[e]??{});try{await navigator.clipboard.writeText(n),this.state={...this.state,copiedEntryId:e},this.render(),window.setTimeout(()=>{this.state={...this.state,copiedEntryId:null},this.render()},1400)}catch{this.state={...this.state,instanceFeedback:{message:`Could not copy link.`,tone:`error`}},this.render()}}exportOpml(){let{filteredEntries:e}=Q(this.state);if(e.length===0)return;let t=e.filter(e=>r(e.lastResult)).length;if(t>0){let e=t===1?`1 feed in this export had an empty or failed last scrape on this instance.`:`${t} feeds in this export had an empty or failed last scrape on this instance.`;if(!window.confirm(`${e} Feeds that recently failed often fail again. Export anyway?`))return}H(q(this.state.instanceUrl,e,this.state.parametersById))}},$=document.getElementById(`feed-directory-app`);$&&new ge($).start();