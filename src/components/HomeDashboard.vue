<template>
    <v-container v-if="!renderCheck">
    <v-row no-gutters>
      <v-col>
        <v-sheet class="pa-6 ma-2 rounded-lg bg-primaryContainer on-primaryContainer" elevation="2" rounded > 
            <div :class="titleSize + ' text-primary'" color="">{{ //greetingMessages[periodOfDay] + ', ' + cadetName   
                t(greetingMessage, {name: cadetName})
            }}</div>  
        </v-sheet>
      </v-col>
    </v-row>

    <v-row no-gutters>
        <v-col cols="12" md="6">
            <my-training-program :cadet-data="cadet" v-if="cadet.currentLocalTraining" :append-fill-height="appendFillHeight"/>

        </v-col>
        <v-col cols="12" md="6">

            <upcoming-activities :append-fill-height="appendFillHeight"/>
        </v-col>
    </v-row>
    <v-row no-gutters>
        <v-col cols="12" md="6">
            <overall-progress :append-fill-height="appendFillHeight" />
        </v-col>
        <v-col cols="12" md="6">
            <MyEvaluations :append-fill-height="appendFillHeight"/>
        </v-col>
    </v-row>
</v-container>  
<v-overlay v-model="renderCheck" :persistent="true" class="align-center justify-center text-center">
            <v-sheet class="pa-6 rounded-lg">
                <div>Loading - Chargement</div><br>
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-sheet>
</v-overlay>
<!--<v-btn @click="numberOfCheese++" prepend-icon="mdi-cheese" class="ma-2 px4 bg-primaryContainer on-PrimaryContainer" variant="flat">Cheese Counter: {{ numberOfCheese }}</v-btn> -->

</template>

<script setup>
    import { onMounted, ref, computed } from 'vue';
    import { willoughby, cadet } from '@/assets/data';
    import { useDisplay } from 'vuetify';
    import OverallProgress from './HomeDashboardComponents/OverallProgress.vue';
    import UpcomingActivities from '@/components/HomeDashboardComponents/UpcomingActivities.vue'
    import MyTrainingProgram from '@/components/HomeDashboardComponents/MyTrainingProgram.vue'
    import MyEvaluations from './HomeDashboardComponents/MyEvaluations.vue';
    import { useI18n } from 'vue-i18n';
    console.log(cadet)
    
    const { t } = useI18n()

    let overlay = ref(false)

    overlay.value = true

    const { mdAndUp } = useDisplay()

    let periodOfDay = ref(0)
    let numberOfCheese = ref(0)
    let loadedCadetProfile = ref(willoughby)
    let titleSizes = [
        'text-h2',
        'text-h3'
    ]

    onMounted(() => {
        const date = new Date()
        console.log(date.getHours())
        if (date.getHours() >= 19 || date.getHours() <= 2) {
            periodOfDay.value = 2
        } else if (date.getHours() >= 12 && date.getHours() < 19) {
            periodOfDay.value = 1
        } else {
            periodOfDay.value = 0
        }
        /*console.log(greetingMessages.value[periodOfDay.value])*/
    })
    
    const greetingMessage = computed(() => {
        switch (periodOfDay.value) {
            case 0:
                return 'dashboardStrings.greetings.morning'
            case 1:
                return 'dashboardStrings.greetings.afternoon'
            case 2:
                return 'dashboardStrings.greetings.evening'
        }
    })

    const renderCheck = computed(() => {
        if (cadet.value == 'No Data') {
            return true
        } else {
            return false
        }
    })

    const cadetName = computed( () => { return loadedCadetProfile.value.rank +  ' ' + loadedCadetProfile.value.lname })
    const titleSize = computed ( () => {
        if (mdAndUp.value) {
            return titleSizes[0]
        } else {
            return titleSizes[1]
        }
    })

    const appendFillHeight = computed ( () => {
        if (mdAndUp.value) {
            return 'fill-height'
        } else {
            return null
        }
    })
</script>

<style scoped>
    
</style>