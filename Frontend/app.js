const api = '/api';
const state = { user: JSON.parse(localStorage.getItem('airtune-user') || 'null'), tracks: [], current: null, authMode: 'login' };
const $ = (s) => document.querySelector(s);
const authDialog = $('#auth-dialog'), studioDialog = $('#studio-dialog'), player = $('#audio-player');

function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3200); }
async function request(path, options = {}) { const res = await fetch(api + path, { credentials: 'same-origin', headers: { ...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'}), ...options.headers }, ...options }); const data = await res.json().catch(() => ({})); if (!res.ok) { const details = data.errors?.map(error => error.message).join(' ') || data.message; const error = new Error(details || `Request failed (${res.status}). Please restart the backend and try again.`); error.status = res.status; throw error; } return data; }
function updateAccount() { const area = $('#account-actions'), mobileArea = $('#mobile-account-actions'); if (!state.user) { area.innerHTML = '<button class="text-button" data-open-auth="login">Log in</button><button class="pill-button" data-open-auth="register">Join Airtune</button>'; mobileArea.innerHTML = '<button class="text-button" data-open-auth="login">Log in</button><button class="pill-button" data-open-auth="register">Join Airtune</button>'; return; } area.innerHTML = `<span class="user-chip">${state.user.username} · ${state.user.role}</span><button class="text-button" id="logout-button">Log out</button>`; mobileArea.innerHTML = `<span class="user-chip">${state.user.username} · ${state.user.role}</span><button class="text-button" id="mobile-logout-button">Log out</button>`; $('#logout-button').onclick = logout; $('#mobile-logout-button').onclick = logout; }
function renderTracks() { const list = $('#track-list'); const info = $('#music-state'); if (!state.tracks.length) { info.textContent = 'No tracks have been uploaded yet. Artists can change that in the studio.'; info.hidden = false; list.innerHTML = ''; return; } info.hidden = true; list.innerHTML = state.tracks.map((t,i) => `<article class="track" data-id="${t._id}"><span class="track-number">${String(i+1).padStart(2,'0')}</span><div><div class="track-title">${escapeHtml(t.title)}</div><div class="track-artist">${escapeHtml(t.artist?.username || 'Independent artist')}</div></div><span class="track-duration">PLAY ↗</span></article>`).join(''); list.querySelectorAll('.track').forEach(el => el.onclick = () => playTrack(state.tracks.find(t => t._id === el.dataset.id))); }
function renderAlbums(albums) { const grid=$('#album-grid'), info=$('#album-state'); if (!albums.length) { info.textContent='No albums have been released yet.'; info.hidden=false; grid.innerHTML=''; return; } info.hidden=true; grid.innerHTML=albums.map(a=>`<article class="album" data-album-id="${a._id}"><div class="album-art"></div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.artist?.username || 'Unknown artist')}</p></article>`).join(''); grid.querySelectorAll('.album').forEach(card=>card.onclick=()=>openAlbum(card.dataset.albumId)); }
function closeAlbumDialog() { const dialog=$('#album-dialog'); if (dialog.open) dialog.close(); dialog.removeAttribute('open'); dialog.style.display='none'; }
function renderAlbumEdit(album, tracks) { const edit=$('#album-edit'); const isOwner=state.user?.role==='artist' && String(album.artist?._id)===String(state.user.id); if (!isOwner) { edit.innerHTML=''; return; } const included=new Set(tracks.map(track=>String(track._id))); const available=state.tracks.filter(track=>!included.has(String(track._id))); if (!available.length) { edit.innerHTML='<p class="album-empty">All of your uploaded tracks are already in this album.</p>'; return; } edit.innerHTML=`<h3>Add tracks</h3><form id="add-tracks-form"><select name="musics" multiple required>${available.map(track=>`<option value="${track._id}">${escapeHtml(track.title)}</option>`).join('')}</select><button class="pill-button" type="submit">Add selected tracks</button><p class="form-message" id="add-tracks-message"></p></form>`; $('#add-tracks-form').onsubmit=async(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);const message=$('#add-tracks-message');message.textContent='Adding tracks...';try { const data=await request(`/music/albums/${album._id}/tracks`,{method:'PATCH',body:JSON.stringify({musics:form.getAll('musics')})}); toast(data.message); await loadMusic(); await openAlbum(album._id); } catch (error) { message.textContent=error.message; }}; }
async function openAlbum(albumId) { const dialog=$('#album-dialog'); dialog.style.display=''; const list=$('#album-track-list'); $('#album-edit').innerHTML=''; $('#album-detail-title').textContent='Loading album...'; $('#album-detail-artist').textContent=''; $('#album-track-count').textContent=''; list.innerHTML='<p class="album-empty">Loading tracks from Airtune...</p>'; if (!dialog.open) dialog.showModal(); try { const { album }=await request(`/music/albums/${albumId}`); const tracks=album.musics||[]; const artist=album.artist?.username||'Airtune artist'; $('#album-detail-title').textContent=album.title; $('#album-detail-artist').textContent=artist; $('#album-track-count').textContent=`${tracks.length} ${tracks.length===1?'track':'tracks'}`; list.innerHTML=tracks.length?tracks.map((track,index)=>`<button class="album-detail-track" data-track-id="${track._id}"><span>${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(track.title)}</strong><span>PLAY</span></button>`).join(''):'<p class="album-empty">This album does not have any tracks yet.</p>'; list.querySelectorAll('.album-detail-track').forEach(button=>button.onclick=()=>{const track=tracks.find(item=>item._id===button.dataset.trackId); playTrack({...track,artist:track.artist||album.artist});}); renderAlbumEdit(album,tracks); } catch (err) { list.innerHTML=`<p class="album-empty">${escapeHtml(err.message)}</p>`; toast(err.message); } }
function escapeHtml(value='') { const div=document.createElement('div'); div.textContent=value; return div.innerHTML; }
async function loadMusic() { if (!state.user) return; $('#music-state').hidden=false; $('#music-state').textContent='Loading releases from the API…'; try { const [music, albums] = await Promise.all([request('/music'),request('/music/albums')]); state.tracks=music.musics||[]; updateAccount(); renderTracks(); renderAlbums(albums.albums||[]); updateStudioTracks(); } catch (err) { if (err.status === 401) { state.user=null; state.tracks=[]; localStorage.removeItem('airtune-user'); updateAccount(); renderTracks(); renderAlbums([]); return; } $('#music-state').textContent=err.message; $('#album-state').textContent='Log in to browse albums.'; } }
function playTrack(track) { if (!track?.uri) return toast('This track has no audio URL.'); state.current=track; player.src=track.uri; $('#player-seek').value=0; $('#player-seek').max=0; $('#player-seek').disabled=true; $('#player-current-time').textContent='0:00'; $('#player-duration').textContent='0:00'; player.play().catch(()=>toast('Press play again to start audio.')); $('#player-title').textContent=track.title; $('#player-artist').textContent=track.artist?.username || 'Airtune artist'; $('#feature-title').textContent=track.title; $('#player-toggle').textContent='Ⅱ'; }
function formatTime(seconds) { if (!Number.isFinite(seconds)) return '0:00'; const minutes=Math.floor(seconds/60); const remaining=Math.floor(seconds%60); return `${minutes}:${String(remaining).padStart(2,'0')}`; }
function updatePlayerProgress() { const duration=player.duration; const position=player.currentTime; $('#player-current-time').textContent=formatTime(position); $('#player-duration').textContent=formatTime(duration); const seek=$('#player-seek'); if (Number.isFinite(duration) && duration > 0) { seek.max=duration; seek.value=position; seek.disabled=false; seek.style.setProperty('--progress', `${(position / duration) * 100}%`); } }
function seekBy(seconds) { if (!Number.isFinite(player.duration)) return; player.currentTime=Math.max(0,Math.min(player.currentTime+seconds,player.duration)); }
function updateStudioTracks() { const select=$('#album-tracks'); select.innerHTML=state.tracks.map(t=>`<option value="${t._id}">${escapeHtml(t.title)}</option>`).join(''); const renameSelect=$('#rename-track'); const ownTracks=state.tracks.filter(track=>String(track.artist?._id || track.artist)===String(state.user?.id)); renameSelect.innerHTML=ownTracks.length?ownTracks.map(track=>`<option value="${track._id}">${escapeHtml(track.title)}</option>`).join(''):'<option value="">No uploaded tracks yet</option>'; renameSelect.disabled=!ownTracks.length; }
function openAuth(mode) { state.authMode=mode; const register=mode==='register'; $('#auth-title').textContent=register?'Make it yours.':'Welcome back.'; $('#auth-subtitle').textContent=register?'Create an account for the music ahead.':'Log in and let the music find you.'; $('#username-field').hidden=!register; $('#email-field').hidden=!register; $('#role-field').hidden=!register; $('#auth-submit').innerHTML=register?'Create account <span>↗</span>':'Log in <span>↗</span>'; $('#auth-switch').textContent=register?'Already have an account? Log in':'New here? Create an account'; $('#auth-form').reset(); $('#auth-message').textContent=''; authDialog.showModal(); }
$('#auth-form').onsubmit=async(e)=>{e.preventDefault();const form=new FormData(e.currentTarget);let payload=Object.fromEntries(form);if(state.authMode==='login'){const identifier=String($('#username-field input').value||'').trim();payload={password:form.get('password')};if(identifier.includes('@')) payload.email=identifier;else payload.username=identifier;} $('#auth-message').textContent='';try{const data=await request('/auth/'+(state.authMode==='register'?'register':'login'),{method:'POST',body:JSON.stringify(payload)});state.user=data.user;localStorage.setItem('airtune-user',JSON.stringify(data.user));authDialog.close();updateAccount();toast(data.message);loadMusic();}catch(err){$('#auth-message').textContent=err.message;}};
$('#auth-switch').onclick=()=>openAuth(state.authMode==='login'?'register':'login');
async function logout(){try{await request('/auth/logout',{method:'POST'});}catch{}state.user=null;state.tracks=[];localStorage.removeItem('airtune-user');updateAccount();renderTracks();renderAlbums([]);toast('You’re logged out.');}
$('#upload-form').onsubmit=async(e)=>{e.preventDefault();const formElement=e.currentTarget;const msg=$('#upload-message');msg.textContent='Uploading…';try{const data=await request('/music/upload',{method:'POST',body:new FormData(formElement)});toast(data.message);formElement.reset();msg.textContent='';await loadMusic();}catch(err){msg.textContent=err.message;}};
$('#rename-form').onsubmit=async(e)=>{e.preventDefault();const formElement=e.currentTarget;const form=new FormData(formElement);const msg=$('#rename-message');msg.textContent='Saving…';try{const data=await request(`/music/${form.get('musicId')}`,{method:'PATCH',body:JSON.stringify({title:form.get('title')})});toast(data.message);formElement.reset();msg.textContent='';await loadMusic();}catch(err){msg.textContent=err.message;}};
$('#album-form').onsubmit=async(e)=>{e.preventDefault();const formElement=e.currentTarget;const form=new FormData(formElement);const msg=$('#album-message');msg.textContent='Creating album…';try{const data=await request('/music/album',{method:'POST',body:JSON.stringify({title:form.get('title'),musics:form.getAll('musics')})});toast(data.message);formElement.reset();msg.textContent='';}catch(err){msg.textContent=err.message;}};
document.addEventListener('click',e=>{const mode=e.target.dataset.openAuth;if(mode)openAuth(mode);});
$('#mobile-menu-toggle').onclick=()=>{const menu=$('#mobile-menu'), toggle=$('#mobile-menu-toggle'), open=menu.hidden; menu.hidden=!open; toggle.setAttribute('aria-expanded',String(open));};
$('#mobile-menu').addEventListener('click',event=>{if(event.target.matches('a,button')){$('#mobile-menu').hidden=true;$('#mobile-menu-toggle').setAttribute('aria-expanded','false');}});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
$('#album-close').addEventListener('click', closeAlbumDialog);
$('#artist-button').onclick=()=>{if(!state.user)return openAuth('login');if(state.user.role!=='artist')return toast('Artist accounts can access the studio.');updateStudioTracks();studioDialog.showModal();}; $('#explore-button').onclick=()=>$('#discover').scrollIntoView(); $('#refresh-button').onclick=loadMusic; $('#hero-play').onclick=()=>state.tracks[0]?playTrack(state.tracks[0]):toast('Log in to discover music.'); $('#player-toggle').onclick=()=>{if(!player.src)return $('#hero-play').click();if(player.paused){player.play();$('#player-toggle').textContent='Ⅱ';}else{player.pause();$('#player-toggle').textContent='▶';}}; player.onended=()=>$('#player-toggle').textContent='▶';
$('#seek-back').onclick=()=>seekBy(-10);
$('#seek-forward').onclick=()=>seekBy(10);
$('#player-seek').oninput=(event)=>{ if (Number.isFinite(player.duration)) { player.currentTime=Number(event.target.value); event.target.style.setProperty('--progress', `${(Number(event.target.value) / player.duration) * 100}%`); } };
player.addEventListener('loadedmetadata', updatePlayerProgress);
player.addEventListener('timeupdate', updatePlayerProgress);
player.addEventListener('durationchange', updatePlayerProgress);
player.addEventListener('play',()=>document.body.classList.add('is-playing'));
player.addEventListener('pause',()=>document.body.classList.remove('is-playing'));
player.addEventListener('ended',()=>document.body.classList.remove('is-playing'));
if(state.user) loadMusic(); else updateAccount();

// Login accepts one identifier; registration keeps its separate username and email fields.
function syncAuthFields() {
  const register = state.authMode === 'register';
  const usernameField = $('#username-field'), usernameInput = $('#username-field input');
  const emailField = $('#email-field'), emailInput = $('#email-field input');
  const passwordInput = $('#auth-form input[name="password"]');
  authDialog.classList.toggle('login-mode', !register);
  usernameField.hidden = false;
  emailField.hidden = !register;
  usernameInput.name = 'username';
  usernameInput.placeholder = register ? '' : 'Username or email';
  if (register) usernameInput.setAttribute('pattern', '[A-Za-z0-9_]+'); else usernameInput.removeAttribute('pattern');
  passwordInput.placeholder = register ? '' : 'Password';
  emailInput.required = register;
}
document.addEventListener('click', event => {
  if (event.target.closest('[data-open-auth]') || event.target.id === 'auth-switch') setTimeout(syncAuthFields);
});
document.addEventListener('input', event => {
  if (state.authMode !== 'login' || !event.target.matches('#username-field input')) return;
  event.target.name = event.target.value.includes('@') ? 'email' : 'username';
});
$('#auth-submit').addEventListener('click', () => {
  if (state.authMode !== 'login') return;
  const identifier = $('#username-field input');
  identifier.name = identifier.value.includes('@') ? 'email' : 'username';
});
document.addEventListener('submit', event => {
  if (event.target !== $('#auth-form') || state.authMode !== 'login') return;
  const identifier = $('#username-field input');
  identifier.name = identifier.value.includes('@') ? 'email' : 'username';
}, true);
$('#auth-form').addEventListener('submit', event => {
  if (state.authMode !== 'login') return;
  const identifier = $('#username-field input');
  identifier.name = identifier.value.includes('@') ? 'email' : 'username';
}, true);

const baseUpdateAccount = updateAccount;
function renderAdminAccess() {
  document.querySelectorAll('#admin-button').forEach(button => button.remove());
  if (state.user?.role !== 'admin') return;
  const button = document.createElement('button');
  button.id = 'admin-button';
  button.className = 'text-button';
  button.type = 'button';
  button.textContent = 'Artist requests';
  button.onclick = openArtistRequests;
  $('#account-actions').prepend(button);
}
updateAccount = function () { baseUpdateAccount(); renderAdminAccess(); };

const adminDialog = document.createElement('dialog');
adminDialog.id = 'admin-dialog';
adminDialog.innerHTML = '<button class="close" type="button" aria-label="Close">×</button><div class="modal-copy"><p class="eyebrow">ADMIN</p><h2>Artist requests</h2><p>Approve artists before they can upload music.</p></div><div id="artist-request-list" class="artist-request-list"></div>';
document.body.append(adminDialog);
adminDialog.querySelector('.close').onclick = () => adminDialog.close();

async function openArtistRequests() {
  adminDialog.showModal();
  const list = $('#artist-request-list');
  list.innerHTML = '<p class="album-empty">Loading artist requests...</p>';
  try {
    const { artists } = await request('/admin/artist-requests');
    list.innerHTML = artists.length ? artists.map(artist => `<article class="artist-request"><div><strong>${escapeHtml(artist.username)}</strong><span>${escapeHtml(artist.email)}</span></div><div><button data-decision="approved" data-user-id="${artist._id}">Approve</button><button data-decision="rejected" data-user-id="${artist._id}">Reject</button></div></article>`).join('') : '<p class="album-empty">No pending artist requests.</p>';
  } catch (error) { list.innerHTML = `<p class="album-empty">${escapeHtml(error.message)}</p>`; }
}
adminDialog.addEventListener('click', async event => {
  const button = event.target.closest('[data-decision]');
  if (!button) return;
  button.disabled = true;
  try {
    const result = await request(`/admin/artist-requests/${button.dataset.userId}`, { method: 'PATCH', body: JSON.stringify({ status: button.dataset.decision }) });
    toast(result.message);
    openArtistRequests();
  } catch (error) { toast(error.message); button.disabled = false; }
});

$('#artist-button').onclick = () => {
  if (!state.user) return openAuth('login');
  if (state.user.role !== 'artist') return toast('Only approved artist accounts can access the studio.');
  if (state.user.artistStatus !== 'approved') return toast('Your artist request is pending admin approval.');
  updateStudioTracks();
  studioDialog.showModal();
};
