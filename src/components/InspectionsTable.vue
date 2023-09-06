<template>
<v-container>
    <v-row>
        <v-col>
            <v-card elevation="2" class="pa-6 rounded-lg">
                <v-card-title>{{ t('inspectionsTable.title') }}</v-card-title>
                <v-card-text>
                    <div class="text-center text-h6">Phase & Division</div>
                    <v-container>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-select :items="listOfDisplayPhases" v-model="selectedPhase" placeholder="Phase">
                                </v-select>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select :items="availablePhases[phase].availableDivisions" v-model="selectedDivision"  placeholder="Division">
                                </v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                {{t('inspectionsTable.completeInspectionsToggle')}}
                                <v-switch v-model="useComplexInspections" color="primary">Complete Inspections</v-switch>

                            </v-col>
                            <v-col cols="12" md="6">
                                {{ t('inspectionsTable.inspectStaff') }}
                                <v-switch v-model="inspectStaff" color="primary">Complete Inspections</v-switch>
                            </v-col>
                        </v-row>
                    </v-container>
                    {{ t('inspectionsTable.reference') }}
                </v-card-text>

            </v-card>
        </v-col>
        <v-col>
            <v-card class="pa-6" v-if="inspectionFinished">
                <v-card-title>{{t('inspectionsTable.saveSend.completeTitle')}}</v-card-title>
                <v-btn type="submit" class="ma-2" @click="startOver()">{{ t('inspectionsTable.saveSend.restartButton') }}</v-btn>
            
            </v-card>
            <v-card v-else class="pa-6">
                <v-card-title>{{ t('inspectionsTable.saveSend.title')}}</v-card-title>
                <div class="ma-2">{{t('inspectionsTable.saveSend.correctionToggle')}}</div>
                <v-switch class="ma-2" v-model="correction" color="primary"></v-switch>
                <v-btn type="submit" class="ma-2" @click="save()">{{ t('inspectionsTable.saveSend.saveButton') }}</v-btn>
                <v-btn type="submit" class="ma-2" :loading="generating" @click="generateCSV()">{{ t('inspectionsTable.saveSend.finishButton') }}</v-btn>
            </v-card>

        </v-col>
    </v-row>
    <v-row>
        <v-col v-if="!renderCheck">
            <v-card class="pa-4">
                <v-card-title v-if="inspectStaff">{{ t('inspectionsTable.seniorCadets') }}</v-card-title>
                <v-card-title v-else>{{ t('inspectionsTable.cadets') }}</v-card-title>
                <v-list>
                <v-list-item :value="i" v-for="item, i in data[staffOrCadet]['value']">
                    <v-container v-if="useComplexInspections">
                        <v-row>
                            <v-col cols="12" md="2"><div @click="console.log(inspectionResultSimple[i])">{{ item.last_name + ', ' + item.first_name }}</div></v-col>
                            <v-col cols="6" md="2"><v-text-field :disabled="inspectionFinished" v-model="complexInspectionResults['head'][i]" :placeholder="t('inspectionsTable.tablePlaceholders.inspectionResults.complexPlaceholders.head')"></v-text-field></v-col>
                            <v-col cols="6" md="2"><v-text-field :disabled="inspectionFinished" v-model="complexInspectionResults['torso'][i]" :placeholder="t('inspectionsTable.tablePlaceholders.inspectionResults.complexPlaceholders.torso')"></v-text-field></v-col>
                            <v-col cols="6" md="2"><v-text-field :disabled="inspectionFinished" v-model="complexInspectionResults['legs'][i]" :placeholder="t('inspectionsTable.tablePlaceholders.inspectionResults.complexPlaceholders.legs')"></v-text-field></v-col>
                            <v-col cols="6" md="2"><v-text-field :disabled="inspectionFinished" v-model="complexInspectionResults['foot'][i]" :placeholder="t('inspectionsTable.tablePlaceholders.inspectionResults.complexPlaceholders.foot')"></v-text-field></v-col>
                            <v-col cols="6" md="2"><v-text-field :disabled="inspectionFinished" v-model="complexInspectionResults['accessories'][i]" :placeholder="t('inspectionsTable.tablePlaceholders.inspectionResults.complexPlaceholders.accessories')"></v-text-field></v-col>

                        </v-row>
                    </v-container>
                    <v-container v-else>
                        <v-row>
                            <v-col><div @click="console.log(inspectionResultSimple[i])">{{ item.last_name + ', ' + item.first_name }}</div></v-col>
                            <v-col><v-select :disabled="inspectionFinished" :items="inspectionStates.simple" :item-title="title => {return t(`inspectionsTable.tablePlaceholders.inspectionResults.simpleLevels.${title}`)}" v-model="inspectionResultSimple[i]"  :placeholder="t('inspectionsTable.tablePlaceholders.inspectionResults.title')"></v-select></v-col>
                        </v-row>
                    </v-container>
                </v-list-item>
            </v-list>
            </v-card>
        </v-col>
    </v-row>
</v-container>
<v-overlay v-model="renderCheck" :persistent="true" class="align-center justify-center text-center">
            <v-sheet class="pa-6 rounded-lg">
                <div>Loading - Chargement</div><br>
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-sheet>
</v-overlay>
<v-overlay v-model="savedOverlay" class="align-center justify-center text-center">
    <v-sheet class="pa-6 rounded-lg">
                <div>Saved! - Sauvegardé!</div><br>
                <v-btn @click="savedOverlay = false">Close - Fermer</v-btn>
            </v-sheet>
</v-overlay>
</template>
<script setup>
    import { ref, computed } from 'vue';
    import { Api } from '@/services/api';
    import { useI18n } from 'vue-i18n';
    import { onMounted } from 'vue';
    import { json2csv } from 'json-2-csv'
    import { account } from '@/stores/auth';
    const {t} = useI18n()

    const data = ref('No Data')
    const phase = ref('phase3')
    const division = ref('huron')
    const inspectionResultSimple = ref([])
    const inspectionStates = ref({
        simple: ['sat', 'nsat', 'nr', 'na']
    })
    const inspectionFinished = ref(false)
    const correction = ref(false)
    const useComplexInspections = ref(false)
    const inspectStaff = ref(false)
    const complexInspectionResults = ref({
        head: [],
        torso: [],
        legs: [],
        foot: [],
        accessories: [],
    })

    const staffOrCadet = computed(() => {
        if (inspectStaff.value) {
            complexInspectionResults.value = {
                head: [],
                torso: [],
                legs: [],
                foot: [],
                accessories: [],
            }
            inspectionResultSimple.value = []
            return 'seniorCdt'
        } else {
            complexInspectionResults.value = {
                head: [],
                torso: [],
                legs: [],
                foot: [],
                accessories: [],
            }
            inspectionResultSimple.value = []
            return 'cdt'
        }
    })
    const savedOverlay = ref(false)
    function save() {
        localStorage.setItem('phase', JSON.stringify(phase.value))
        localStorage.setItem('division', JSON.stringify(division.value))
        localStorage.setItem('inspectionResultSimple', JSON.stringify(inspectionResultSimple.value))
        if (useComplexInspections) {
            localStorage.setItem('useComplexInspections', JSON.stringify(useComplexInspections.value))
            localStorage.setItem('complexInspectionResults', JSON.stringify(complexInspectionResults.value))
        }
        savedOverlay.value = true
    }
    onMounted(() => {
        if (localStorage.getItem('phase') !== null) {
            phase.value = JSON.parse(localStorage.getItem('phase'))
            division.value = JSON.parse(localStorage.getItem('division'))
            inspectionResultSimple.value = JSON.parse(localStorage.getItem('inspectionResultSimple'))
            if (localStorage.getItem('complexInspectionResults')) {
                useComplexInspections.value = JSON.parse(localStorage.getItem('useComplexInspections'))
                complexInspectionResults.value = JSON.parse(localStorage.getItem('complexInspectionResults'))
            }
        }
    })

    const renderCheck = computed(() => {
        if (data.value === 'No Data') {
            return true
        } else {
            return false
        }
    })
    const selectedPhase = computed({
        get() {
            return availablePhases.value[phase.value].friendlyName
        },
        set(newPhase) {
            data.value = 'No Data'
            inspectionResultSimple.value = []
            phase.value = newPhase.replace(/\s+/g, '');
            division.value = availablePhases.value[phase.value].availableDivisions[0].toLowerCase()
            Api.get(`http://localhost:8080/cadets?phase=${phase.value}&division=${division.value}`).then((obtainedData) => {
                data.value = obtainedData
                console.log(data.value)
            })
        }
    })
    Api.get(`http://localhost:8080/cadets?phase=phase3&division=${division.value}`).then((obtainedData) => {
            console.log(obtainedData)
            data.value = obtainedData
            console.log(data.value)
        })
    

    const availablePhases = ref({
        phase3: {
            name: 'phase3',
            friendlyName: 'Phase 3',
            availableDivisions: ['Huron', 'Nanaimo']
        }
    })
    const listOfDisplayPhases = ref(['Phase 3'])
    const selectedDivision = computed({
        get() {
            let upperCaseDivision = division.value.charAt(0).toUpperCase() + division.value.slice(1)
            return upperCaseDivision
        },
        set(newDivision) {
            data.value = 'No Data'
            division.value = newDivision.toLowerCase()
            inspectionResultSimple.value = []
            Api.get(`http://localhost:8080/cadets?phase=${phase.value}&division=${division.value}`).then((obtainedData) => {
                data.value = obtainedData
                console.log(data.value)
            })
        }
    })
    Api.get(`http://localhost:8080/cadets?phase=${phase.value}&division=${division.value}`).then((obtainedData) => {
            console.log(obtainedData)
            data.value = obtainedData
            console.log(data.value)
        })
    


    // Function to download data to a file
    function startDownloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    
    downloadLink.href = url;
    downloadLink.download = fileName;
    
    // Append download link to the DOM and trigger a click to start the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up after the download is complete
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    //location.reload()
    }

    const generating = ref(false)

    async function generateCSV() {
        generating.value = true
        let dataWithInspectionDetails = data.value
        for (let i = 0; i < dataWithInspectionDetails[staffOrCadet.value].value.length; i++) {
            console.log(inspectionResultSimple.value[i])
            if (!inspectionResultSimple.value[i]) {
                dataWithInspectionDetails[staffOrCadet.value].value[i].simpleInspectionResult = '-'
            } else {
                dataWithInspectionDetails[staffOrCadet.value].value[i].simpleInspectionResult = inspectionResultSimple.value[i]
            }
        }
        console.log(useComplexInspections.value)
        if (useComplexInspections.value === true) {
            for (let i = 0; i < dataWithInspectionDetails[staffOrCadet.value].value.length; i++) {
                for (const item in complexInspectionResults.value) {
                    if (complexInspectionResults.value.hasOwnProperty(item)) {
                        if (!complexInspectionResults.value[item][i]) {
                            dataWithInspectionDetails[staffOrCadet.value].value[i][item] = "-"
                        } else {
                            dataWithInspectionDetails[staffOrCadet.value].value[i][item] = complexInspectionResults.value[item][i]
                        }
                    }
                }
        }
        }
        //console.log(dataWithInspectionDetails)
        let csvResult = "INSPECTION SHEET | FEUILLE D'INSPECTION\n"
        if (inspectStaff) {
            csvResult += '-------**SeniorCDT**-------\n'
        } else {
            csvResult += '-------**Cadets**-------\n'
        }
        csvResult += await json2csv(dataWithInspectionDetails[staffOrCadet.value].value)
        csvResult += "\nINSPECTED BY: " + account.value.name + ' ID: '+ account.value.username + ' NBF:' + JSON.stringify(account.value.idTokenClaims.nbf) + ' EXP: ' + JSON.stringify(account.value.idTokenClaims.exp)
        console.log(account.value)
        console.log(csvResult)
        generating.value = false
        let fileName = `INSPECTIONS-${phase.value}-${division.value}-${Date.now()}-${staffOrCadet.value}`
        if (correction.value) {
            fileName += '-CORRECTION'
        }
        fileName += '.csv'
        startDownloadFile(csvResult, fileName, 'text/csv')
        inspectionFinished.value = true
    }

    function startOver() {
        localStorage.clear('inspectionResultSimple')
        localStorage.clear('phase')
        localStorage.clear('division')
        localStorage.clear('useComplexInspections')
        localStorage.clear('complexInspectionResults')  
        location.reload()
    }
    //const cadetList = ref(await Api.get(`http://localhost:8080/cadet`).catch((err) => {console.log(err)}))
    // const renderCheck = computed(() => {
    //     if (cadet.value == 'No Data') {
    //         return true
    //     } else {
    //         return false
    //     }
    // })
</script>