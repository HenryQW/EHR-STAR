<template>
  <div class="container-fluid">
    <h1>EHR Related Datasets</h1>
    <b-container class="mb-2" fluid>
      <b-row>
        <b-col md="8">
          <b-form-group
            v-slot="{ ariaDescribedby }"
            v-model="sortDirection"
            label="Show datasets with"
            description="Leave all unchecked to show all datasets"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="lg"
            class="mb-0"
          >
            <b-form-checkbox-group
              v-model="filterOptionsSelected"
              :aria-describedby="ariaDescribedby"
              class="mt-1"
            >
              <b-form-checkbox
                v-for="option in filterOptions"
                :key="option.value"
                :value="option.value"
                >{{ option.text }}</b-form-checkbox
              >
            </b-form-checkbox-group>
          </b-form-group>
        </b-col>
        <b-col md="4">
          <b-form-group>
            <b-input-group size="md">
              <b-input-group-prepend>
                <b-input-group-text>
                  <b-icon icon="search" />
                </b-input-group-text>
              </b-input-group-prepend>

              <b-form-input
                id="filter-input"
                v-model="filter"
                type="search"
                placeholder="Type to Search"
              ></b-form-input>

              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''"
                  >Clear</b-button
                >
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>

      <!-- Main table element -->
      <b-table
        :items="filteredItems"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        :filter="filter"
        :filter-included-fields="filterOn"
        :sort-by.sync="sortBy"
        :sort-direction="sortDirection"
        :sort-desc="true"
        stacked="md"
        show-empty
        small
        fixed
        striped
        @filtered="onFiltered"
      >
        <template #cell(title)="row">
          <b-badge v-if="row.item.scope[0] === 'context'" variant="warning"
            >context</b-badge
          >
          <b-badge v-if="row.item.scope[0] === 'focus'" variant="success"
            >focus</b-badge
          >
          {{ row.item.title }}
          <b-button
            target="_blank"
            :href="'https://doi.org/' + row.item.DOI"
            variant="danger"
            size="sm"
          >
            Read
          </b-button>
        </template>

        <template #cell(type)="row">
          <b-badge v-if="row.item.type === 'catalogue'" variant="danger"
            >Catalogue</b-badge
          >
          <b-badge v-else-if="row.item.type === 'collection'" variant="info"
            >Collection</b-badge
          >
          <b-badge v-else icon="x-square-fill" variant="success"
            >Specialized</b-badge
          >
        </template>

        <template #cell(specialty)="row">
          <p v-if="row.item.specialty">{{ row.item.specialty }}</p>
        </template>

        <template #cell(covid)="row">
          <b-icon
            v-if="row.item.covid === 'yes'"
            icon="check-square-fill"
            variant="danger"
          ></b-icon>
        </template>

        <template #cell(registration)="row">
          <b-icon
            v-if="row.item.registration === 't'"
            icon="check-square-fill"
            variant="danger"
          ></b-icon>
          <b-icon
            v-else-if="row.item.registration === 'o'"
            icon="dash-square-fill"
            variant="info"
          ></b-icon>
          <b-icon v-else icon="x-square-fill" variant="success"></b-icon>
        </template>

        <template #cell(verification)="row">
          <b-icon
            v-if="row.item.verification === 't'"
            icon="check-square-fill"
            variant="danger"
          ></b-icon>
        </template>

        <template #cell(fee)="row">
          <b-icon
            v-if="row.item.fee === 't'"
            icon="check-square-fill"
            variant="danger"
          ></b-icon>
        </template>

        <template #table-caption>
          <p>
            A <b-badge variant="danger">Catalogue</b-badge> data source does not
            host data on its own website but provides links to other webpages.
            <br />
            A <b-badge variant="info">Collection</b-badge> data source provides
            access to multiple datasets from different specialties.
            <br />
            A <b-badge variant="success">Specialized</b-badge> data source
            refers to datasets focusing on a single specialty or area of
            specialization.
          </p>
        </template>
      </b-table>

      <div>
        <b-col sm="12">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="center"
            size="md"
            class="my-0"
          ></b-pagination>
        </b-col>
      </div>
      <hr />
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          name: 'UCI Machine Learning Repository',
          year: 1987,
          citation: 'Graff2017',
          dataset: 110,
          publications: '100+',
          registration: 'o',
          type: 'collection',
        },
        {
          name: 'Rotterdam Study',
          year: 1990,
          citation: 'RotterdamStudy',
          specialty: 'Epidemiology',
          publications: '2000+',
          verification: 'collaboration',
          fee: 't',
          type: 'collection',
          scope: 'out',
        },
        {
          name: 'Study of Health in Pomerania',
          lan: 'German',
          year: 1997,
          citation: 'John2001',
          verification: 't',
          type: 'collection',
          scope: 'out',
        },
        {
          name: 'PhysioNet',
          year: 1999,
          citation: 'Goldberger2000',
          dataset: 126,
          publications: '100+',
          registration: 'o',
          verification: 'some',
          type: 'collection',
        },
        {
          name: 'Public Health Wales',
          year: 1999,
          citation: 'PublicHealthWales',
          dataset: 21,
          type: 'collection',
        },
        {
          name: 'Human Mortality Database',
          year: 2000,
          citation: 'Shkolnikov',
          specialty: 'Mortality',
          dataset: 50,
          publications: 577,
          registration: 't',
          covid: 'yes',
        },
        {
          name:
            'Groningen Initiative to Analyze Type 2 Diabetes Treatment (GIANTT)',
          lan: 'Dutch',
          year: 2004,
          citation: 'GIANTT',
          publications: '49',
          registration: 't',
          verification: 't',
          type: 'collection',
          scope: 'out',
          fee: 't',
        },
        {
          name: "Tracking Adolescents' Individual Lives Survey (TRAILS)",
          year: 2004,
          citation: 'Trails',
          publications: '327',
          registration: 't',
          verification: 'collaborationfree',
          type: 'collection',
          scope: 'out',
          fee: 't',
        },
        {
          name: 'LifeLines Biobank',
          year: 2006,
          citation: 'LifelinesBiobank',
          publications: '312',
          registration: 't',
          verification: 't',
          type: 'collection',
          scope: 'out',
          covid: 'yes',
          fee: 't',
        },
        {
          name: 'National NLP Clinical Challenges',
          year: 2006,
          citation: 'n2c2',
          dataset: 50,
          publications: 124,
          registration: 't',
          verification: 't',
        },
        {
          name: 'SAIL Databank',
          year: 2006,
          citation: 'Ford2009',
          publications: '45',
          registration: 't',
          verification: 'collaboration',
          type: 'collection',
          scope: 'out',
        },
        {
          name: 'UK Biobank',
          year: 2006,
          citation: 'UKBiobank',
          publications: '103',
          registration: 't',
          verification: 't',
          type: 'collection',
          scope: 'out',
          fee: 't',
        },
        {
          name: 'FAIRsharing',
          year: 2007,
          citation: 'FAIRsharing',
          publications: '100+',
          registration: 'o',
          type: 'catalogue',
          covid: 'yes',
        },
        {
          name: 'Data.gov',
          year: 2009,
          citation: 'DataGov',
          dataset: 1727,
          type: 'catalogue',
          covid: 'yes',
        },
        {
          name: 'NHS Scotland Open Data',
          year: 2009,
          citation: 'NHSScotlandOpenData',
          dataset: 46,
          type: 'collection',
        },
        {
          name: 'VAST Challenge 2010 Mini 2',
          year: 2010,
          citation: 'VAST2010MC2',
          specialty: 'Pandemic Spread',
          publications: 274,
        },
        {
          name: 'Data.gov.uk',
          year: 2011,
          citation: 'DataGovUK',
          dataset: 1807,
          type: 'collection',
          covid: 'yes',
        },
        {
          name: 'HealthData.gov',
          year: 2011,
          citation: 'HealthData.gov',
          dataset: 4350,
          type: 'catalogue',
          covid: 'yes',
        },
        {
          name: 'SEER Program',
          year: 2011,
          citation: 'NationalCancerInstitute',
          specialty: 'Cancer',
          dataset: 39,
          verification: 'mixed',
          type: 'collection',
          fee: 'some',
          scope: 'out',
        },
        {
          name: 'European Data Portal',
          year: 2012,
          citation: 'EUDataPortal',
          dataset: 10086,
          note: 'not all in English',
          type: 'catalogue',
          covid: 'yes',
        },
        {
          name: 'Maelstrom Catalogue',
          year: 2012,
          citation: 'MaelstromResearch',
          dataset: 205,
          publications: '21',
          registration: 'o',
          type: 'catalogue',
        },
        {
          name: 'OpenDataNI',
          year: 2012,
          citation: 'OpenDataNI',
          dataset: 67,
          type: 'collection',
        },
        {
          name: 're3data',
          year: 2012,
          citation: 'Re3data.org',
          dataset: '2000+',
          type: 'catalogue',
          covid: 'yes',
        },
        {
          name: 'Health Data Research Innovation Gateway',
          year: 2019,
          citation: 'HDR2019',
          registration: 't',
          verification: 'some',
          dataset: 448,
          covid: 'yes',
          type: 'collection',
        },
        {
          name: 'Global Health Data Exchange',
          year: 2013,
          citation: 'UoW2015',
          specialty: 'Mortality',
          dataset: 18,
          covid: 'yes',
          publications: 264,
          registration: 'o',
          type: 'collection',
        },
        {
          name: 'MIMIC-III',
          year: 2013,
          citation: 'Johnson2016',
          specialty: 'Intensive Care',
          publications: 274,
          registration: 't',
          verification: 't',
        },
        {
          name: 'Project Tycho',
          year: 2013,
          citation: 'VanPanhuis2018',
          dataset: 360,
          publications: 18,
          registration: 't',
        },
        {
          name: 'Big Cities Health Coalition',
          year: 2014,
          citation: 'BigCitiesHealthCoalition',
          type: 'collection',
        },
        {
          name: 'Public Health England',
          year: 2017,
          citation: 'PublicHealthEngland',
          type: 'collection',
        },
        {
          name: 'NHS England',
          year: 2017,
          citation: 'NHSEngland',
          dataset: 97,
          type: 'collection',
        },
        {
          name: 'City Health Dashboard',
          year: 2018,
          citation: 'Gourevitch2019',
          type: 'collection',
          scope: 'out',
        },
        {
          name: 'COVID-19 Dashboard',
          year: 2020,
          citation:
            'JohnsHopkinsUniversity2020,JohnsHopkinsUniversity2020b,Dong2020',
          covid: 'yes',
        },
        {
          name: 'COVID-19 Open Research Dataset Challenge',
          year: 2020,
          dataset: 1297,
          publications: '57000+',
          citation: 'Kaggle2020',
          type: 'catalogue',
          covid: 'yes',
        },
        {
          name: 'The Scottish COVID-19 Response Consortium',
          year: 2020,
          dataset: 1,
          citation: 'SCRC2020',
          covid: 'yes',
        },
      ],
      fields: [
        {
          key: 'name',
          label: 'Name',
          sortable: true,
          thStyle: 'width:10%',
        },
        {
          key: 'type',
          label: 'Data Source Type',
          sortable: true,
          thStyle: 'width:7%',
        },
        {
          key: 'specialty',
          label: 'Data Specialty',
          sortable: true,
          thStyle: 'width:7%',
        },
        {
          key: 'dataset',
          label: 'No. of Datasets',
          sortable: true,
          thStyle: 'width:8%',
        },
        {
          key: 'publications',
          label: 'No. of Publications',
          sortable: true,
          thStyle: 'width:8%',
        },
        {
          key: 'covid',
          label: 'COVID-19 Related',
          sortable: true,
          thStyle: 'width:8%',
        },
        {
          key: 'registration',
          label: 'Registration',
          sortable: true,
          thStyle: 'width:5%',
        },
        {
          key: 'verification',
          label: 'Verification',
          sortable: true,
          thStyle: 'width:5%',
        },
        {
          key: 'fee',
          label: 'Fees',
          sortable: true,
          thStyle: 'width:5%',
        },
        {
          key: 'year',
          label: 'Year',
          sortable: true,
          class: 'text-center',
          thStyle: 'width:5%',
        },
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      sortBy: 'year',
      sortDirection: 'asc',
      filter: null,
      filterOn: [],
      filterOptions: [
        { value: 'fee', text: 'Open Access' },
        { value: 'registration', text: 'No registration required' },
        { value: 'verificaiton', text: 'No verificaiton required' },
        { value: 'covid', text: 'Covid-19 related' },
      ],
      filterOptionsSelected: [],
    }
  },
  computed: {
    filteredItems() {
      let res = this.items

      this.filterOptionsSelected.forEach((f) => {
        res = res.filter((r) => {
          let res = false
          switch (f) {
            case 'covid':
              res = r[f] === 'yes'
              break

            default:
              res = !r[f] || r[f] !== 't'
              break
          }
          return res
        })
      })

      // update pagination
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.totalRows = res.length
      return res
    },
  },
  mounted() {
    // Set the initial number of items
    this.totalRows = this.items.length
  },
  methods: {
    filterTable(row, filter) {
      return row.name.toString().toLowerCase().includes(filter.toLowerCase())
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
  },
}
</script>

<style>
.dropdown-menu {
  max-height: 30rem;
  overflow-y: auto;
}

.ESS {
  background-color: #33141e;
  border-color: #33141e;
}

.NLP {
  background-color: #2486b9;
  border-color: #2486b9;
}

.ML {
  background-color: #ed4845;
  border-color: #ed4845;
}

.Clustering {
  background-color: #6e8b74;
  border-color: #6e8b74;
}

.Comparison {
  background-color: #ffa60f;
  border-color: #ffa60f;
  color: black;
}
</style>
