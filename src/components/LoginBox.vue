<template>
    <v-container>
        <v-col>
            <v-card class="rounded-lg">
        <v-card-title>
            {{ t('account.loginLogoutBox.title') }}
        </v-card-title>
        <v-card-actions>
            <v-btn @click="login" v-if="!auth.account">
                {{ t('account.loginLogoutBox.loginButton') }}
            </v-btn>
            <v-btn @click="logout" v-if="auth.account"> 
                {{ t('account.loginLogoutBox.logoutButton') }}
</v-btn>
        </v-card-actions>
    </v-card>
        </v-col>
    </v-container>
    <v-overlay v-model="overlay" :persistent="true" class="align-center justify-center">
            <v-sheet class="pa-6 rounded-lg">
                <div>Please use the pop-up window to continue.</div><br>
                <div>Veuillez vous référer à la fenêtre contextuelle pour continuer.</div>
            </v-sheet>
    </v-overlay>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/stores/auth';
    import { useI18n } from 'vue-i18n';
    const { t } = useI18n()
import { Auth } from '@/services/auth';

let overlay = ref(false)
const router = useRouter()
const props = defineProps(['redirectPath'])

if (!auth.initialized) {
    auth.initialize()
}

function login() {
    console.log(props.redirectPath)
    overlay.value = true
    auth.login().then(() => {overlay.value = false; router.push(props.redirectPath)}, () => {overlay.value = false;})
}


function logout() {
    overlay.value = true
    auth.logout().then(() => {overlay.value = false}, () => {overlay.value = false;})

}

Auth.getToken().then(res => {
    console.log(res)
})
</script>