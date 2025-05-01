const afApp = Vue.createApp({
	components: {
		AfToDoComponent,
		AfSlidesComponent,
	},
	data() {
		return {
			count: 0,
			isOffline: null,
			activeTab: 'slides',
			tabs: {
				slides: {
					name: 'Slides',
					component: 'AfSlidesComponent',
				},
				count: {
					name: 'Count',
				},
				todo: {
					name: 'To Do',
					component: 'AfToDoComponent',
				},
			}
		};
	},
	watch: {
		count(newValue, oldValue) {
			localStorage.setItem('count', newValue);
		},
		activeTab(newValue, oldValue) {
			sessionStorage.setItem('activeTab', newValue);
		},
	},
	methods: {
		increment() {
			this.count++;
		},
		updateOnlineStatus() {
			this.isOffline = !navigator.onLine;
			if (this.isOffline) {
				document.body.classList.add('offline');
			} else {
				document.body.classList.remove('offline');
			}
		},
		refreshPage() {
			window.location.reload();
		},
	},
	mounted() {
		if (localStorage.getItem('count')) {
			this.count = parseInt(localStorage.getItem('count'));
		}

		if (sessionStorage.getItem('activeTab')) {
			this.activeTab = sessionStorage.getItem('activeTab');
		}

		// Add event listeners for online and offline events
		window.addEventListener('online', this.updateOnlineStatus);
		window.addEventListener('offline', this.updateOnlineStatus);
		this.updateOnlineStatus();
	},
	beforeUnmount() {
		// Remove event listeners to avoid memory leaks
		window.removeEventListener('online', this.updateOnlineStatus);
		window.removeEventListener('offline', this.updateOnlineStatus);
	},
	template: `
			<div>
				<h1 class="text-center">
					AroFlo PWA Minimal Demo
					<svg @click="refreshPage" class="refreshIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
				</h1>
				<div class="tabs">
					<template v-for="(tab, name) in tabs">
						<button type="button" @click="activeTab = name" :class="{'active': activeTab === name}" v-text="tab.name"></button>
					</template>
				</div>

				<template v-for="(tab, name) in tabs">
					<div v-if="activeTab === name && tab.component" class="tabs__component">
						<component :is="tab.component"></component>
					</div>
					<div v-else-if="activeTab === 'count' && name === 'count'" class="tabs__component">
						Example of a simple counter using Vue.js and localStorage
						<hr />
						<div class="text-center alert alert-info">
							<button @click="increment" type="button" class="btn btn-primary">Count is: {{ count }}</button>
						</div>
					</div>
				</template>
			</div>
		`
}).mount('#afApp');
