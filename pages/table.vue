<template>
  <div class="container-fluid">
    <h1>EHR Literature</h1>
    <b-container class="mb-2" fluid>
      <!-- User Interface controls -->
      <b-row>
        <b-col lg="5">
          <b-form-group
            v-slot="{ ariaDescribedby }"
            v-model="sortDirection"
            label="Search On"
            description="Leave all unchecked to search on all fields"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="lg"
            class="mb-0"
          >
            <b-form-checkbox-group
              v-model="filterOn"
              :aria-describedby="ariaDescribedby"
              class="mt-1"
            >
              <b-form-checkbox value="author">Authors</b-form-checkbox>
              <b-form-checkbox value="title">Title</b-form-checkbox>
              <b-form-checkbox value="pub">Publication</b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>
        </b-col>

        <b-col lg="4">
          <b-form-tags
            id="author-tags-with-dropdown"
            v-model="authorSelected"
            no-outer-focus
            class="mb-2"
          >
            <template #default="{ tags, disabled, addTag, removeTag }">
              <ul
                v-if="tags.length > 0"
                class="list-inline d-inline-block mb-2"
              >
                <li v-for="tag in tags" :key="tag" class="list-inline-item">
                  <b-form-tag
                    :title="tag"
                    :disabled="disabled"
                    variant="info"
                    @remove="removeTag(tag)"
                    >{{ tag }}</b-form-tag
                  >
                </li>
              </ul>

              <b-dropdown
                size="sm"
                variant="outline-success"
                block
                menu-class="w-100"
              >
                <template #button-content>
                  <b-icon icon="people-fill"></b-icon> Choose authors
                </template>
                <b-dropdown-form @submit.stop.prevent="() => {}">
                  <b-form-group
                    label="Search authors"
                    label-for="author-search-input"
                    label-cols-md="auto"
                    class="mb-0"
                    label-size="sm"
                    :disabled="disabled"
                  >
                    <b-form-input
                      id="author-search-input"
                      v-model="authorSearch"
                      type="search"
                      size="sm"
                      autocomplete="off"
                    ></b-form-input>
                  </b-form-group>
                </b-dropdown-form>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item-button
                  v-for="option in availableTags('author')"
                  :key="option"
                  @click="addToTagValue({ option, addTag })"
                >
                  {{ option }}
                </b-dropdown-item-button>
                <b-dropdown-text v-if="availableTags('author').length === 0">
                  There are no authors available to select
                </b-dropdown-text>
              </b-dropdown>
            </template>
          </b-form-tags>
        </b-col>
        <b-col lg="3">
          <b-form-tags
            id="technique-tags-with-dropdown"
            v-model="techniqueSelected"
            no-outer-focus
            class="mb-2"
          >
            <template #default="{ tags, disabled, addTag, removeTag }">
              <ul
                v-if="tags.length > 0"
                class="list-inline d-inline-block mb-2"
              >
                <li v-for="tag in tags" :key="tag" class="list-inline-item">
                  <b-form-tag
                    :title="tag"
                    :disabled="disabled"
                    variant="info"
                    :class="tag"
                    @remove="removeTag(tag)"
                    >{{ tag }}</b-form-tag
                  >
                </li>
              </ul>

              <b-dropdown
                size="sm"
                variant="outline-success"
                block
                menu-class="w-100"
              >
                <template #button-content>
                  <b-icon icon="bezier"></b-icon> Choose techniques
                </template>
                <b-dropdown-form @submit.stop.prevent="() => {}">
                  <b-form-group
                    label="Search techniques"
                    label-for="technique-search-input"
                    label-cols-md="auto"
                    class="mb-0"
                    label-size="sm"
                    :disabled="disabled"
                  >
                    <b-form-input
                      id="technique-search-input"
                      v-model="techniqueSearch"
                      type="search"
                      size="sm"
                      autocomplete="off"
                    ></b-form-input>
                  </b-form-group>
                </b-dropdown-form>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item-button
                  v-for="option in availableTags('technique')"
                  :key="option"
                  @click="addToTagValue({ option, addTag })"
                >
                  {{ option }}
                </b-dropdown-item-button>
                <b-dropdown-text v-if="availableTags('technique').length === 0">
                  There are no techniques available to select
                </b-dropdown-text>
              </b-dropdown>
            </template>
          </b-form-tags>
        </b-col>
        <b-col sm="12">
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
        :filter-function="filterTable"
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
        <template #cell(author)="row">
          <b-button
            v-for="author in row.item.author"
            :key="author"
            size="sm"
            :variant="authorSelected.includes(author) ? 'success' : 'none'"
            @click="clickAddTag(author)"
          >
            {{ author }}
          </b-button>
        </template>

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

        <template #cell(citation)="row">
          <div @click="openModal(row.item, row.index, $event.target)">
            <b-img
              thumbnail
              fluid
              :src="`/images/${row.item.name}.png`"
            ></b-img>
          </div>
        </template>

        <template #cell(compTech)="row">
          <b-badge
            v-for="tech in row.item.compTech"
            :key="tech"
            size="sm"
            :class="tech"
          >
            {{ tech }}
          </b-badge>
        </template>

        <template #table-caption>
          <b-badge variant="success">focus</b-badge> refers to literature
          <b-badge variant="danger">with</b-badge> a detailed description in our
          EHR STAR. <br />
          <b-badge variant="warning">context</b-badge> refers to literature
          <b-badge variant="danger">without</b-badge> a detailed description in
          our EHR STAR.
        </template>
      </b-table>

      <b-modal
        :id="infoModal.id"
        :title="infoModal.data.title"
        size="lg"
        ok-only
        @hide="resetInfoModal"
      >
        <template #modal-title>
          <h4>
            {{ infoModal.data.title }}
          </h4>

          <h6>
            <i>{{ infoModal.data.pub }}</i>
          </h6>
          <h6>{{ infoModal.data.author.join(', ') }}</h6>
        </template>

        <p v-if="infoModal.data.keywords">
          <b>Keywords</b>:
          <i>{{ infoModal.data.keywords.replaceAll(',', ', ') }}</i>
        </p>

        <b-img
          fluid
          :src="`/images/${infoModal.data.name}.png`"
          :alt="infoModal.data.citation"
        ></b-img>
        <hr />
        <p v-if="infoModal.data.abstract">
          <b>Abstract</b>: <br />
          {{ infoModal.data.abstract }}
        </p>

        <template #modal-footer="{ ok }">
          <div class="w-100">
            <b-button
              variant="primary"
              size="sm"
              class="float-right"
              @click="ok()"
            >
              Close
            </b-button>

            <b-button
              target="_blank"
              :href="'https://doi.org/' + infoModal.data.DOI"
              variant="danger"
              size="sm"
              class="float-right mr-1"
            >
              Read
            </b-button>
          </div>
        </template>
      </b-modal>

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
          DOI: '10.1145/2678025.2701407',
          author: [
            'Sana Malik',
            'Fan Du',
            'Megan Monroe',
            'Eberechukwu Onukwugha',
            'Catherine Plaisant',
            'Ben Shneiderman',
          ],
          EHRCount: '1,178 EHRs shown',
          EHRs: 1001,
          UMLS: ['C0010337', 'C0030677'],
          citation: 'Malik2015',
          compTech: ['ESS'],
          name: 'CoCo',
          pub: 'Proceedings of the 20th International Conference on Intelligent User Interfaces',
          related: ['Onukwugha2016'],
          scope: ['focus'],
          term: ['EHR'],
          title:
            'Cohort Comparison of Event Sequences with Balanced Integration of Visual Analytics and Statistics',
          year: 2015,
          abstract:
            'Finding the differences and similarities between two datasets is a common analytics task. With temporal event sequence data, this task is complex because of the many ways single events and event sequences can differ between the two datasets (or cohorts) of records: the structure of the event sequences (e.g., event order, co-occurring events, or event frequencies), the attributes of events and records (e.g., patient gender), or metrics about the timestamps themselves (e.g., event duration). In exploratory analyses, running statistical tests to cover all cases is time-consuming and determining which results are significant becomes cumbersome. Current analytics tools for comparing groups of event sequences emphasize a purely statistical or purely visual approach for comparison. This paper presents a taxonomy of metrics for comparing cohorts of temporal event sequences, showing that the problem-space is bounded. We also present a visual analytics tool, CoCo (for "Cohort Comparison"), which implements balanced integration of automated statistics with an intelligent user interface to guide users to significant, distinguishing features between the cohorts. Lastly, we describe two early case studies: the first with a research team studying medical team performance in the emergency department and the second with pharmacy researchers.',
          keywords: 'Cohort Comparison,Temporal data,Visual analytics',
        },
        {
          DOI: '10.1145/2836034.2836035',
          EHRCount: 'about 16,000 patients',
          EHRs: 5001,
          ISBN: '978-1-4503-3671-0',
          UMLS: ['C0600139', 'C0679831'],
          author: [
            'Jürgen Bernard',
            'David Sessler',
            'Andreas Bannach',
            'Thorsten May',
            'Jörn Kohlhammer',
          ],
          citation: 'Bernard2015',
          compTech: ['ML'],
          pub: "Proceedings of the 2015 workshop on visual analytics in healthcare - VAHC '15",
          related: ['Preim2020'],
          scope: ['focus'],
          term: ['EHR'],
          title:
            'A visual active learning system for the assessment of patient well-being in prostate cancer research',
          name: 'Visual active learning',
          year: 2015,
          abstract:
            "The assessment of patient well-being is highly relevant for the early detection of diseases, for assessing the risks of therapies, or for evaluating therapy outcomes. The knowledge to assess a patient's well-being is actually tacit knowledge and thus, can only be used by the physicians themselves. The rationale of this research approach is to use visual interfaces to capture the mental models of experts and make them available more explicitly. We present a visual active learning system that enables physicians to label the well-being state of patient histories suffering prostate cancer. The labeled instances are iteratively learned in an active learning approach. In addition, the system provides models and visual interfaces for a) estimating the number of patients needed for learning, b) suggesting meaningful learning candidates and c) visual feedback on test candidates. We present the results of two evaluation strategies that prove the validity of the applied model. In a representative real-world use case, we learned the feedback of physicians on a data collection of more than 16.000 prostate cancer histories.",
          keywords:
            'Active learning,Electronic health care data,Expert feedback,Information visualization,Patient well-being,Regression tree,Visual analytics',
        },
        {
          DOI: '10.1016/j.cmpb.2013.01.007',
          EHRs: 1,
          UMLS: ['C0021400'],
          author: [
            'Lilia L. Ramírez-Ramírez',
            'Yulia R. Gel',
            'Mary Thompson',
            'Eileen Villa',
            'Matt McPherson',
          ],
          citation: 'Ramirez2013',
          compTech: ['GEO'],
          name: 'SIMID',
          pub: 'Computer Methods and Programs in Biomedicine',
          related: ['Carroll2014'],
          scope: ['focus'],
          term: ['Public health'],
          title:
            'A new surveillance and spatio-temporal visualization tool SIMID: SIMulation of Infectious Diseases using random networks and GIS',
          year: 2013,
          abstract:
            'In this paper we discuss the SIMID tool for simulation of the spread of infectious disease, enabling spatio-temporal visualization of the dynamics of influenza outbreaks. SIMID is based on modern random network methodology and implemented within the R and GIS frameworks. The key advantage of SIMID is that it allows not only for the construction of a possible scenario for the spread of an infectious disease but also for the assessment of mitigation strategies, variation and uncertainty in disease parameters and randomness in the progression of an outbreak. We illustrate SIMID by application to an influenza epidemic simulation in a population constructed to resemble the Region of Peel, Ontario, Canada. textcopyright 2013 Elsevier Ireland Ltd.',
          keywords:
            'Disease outbreaks,Networks,Software for epidemic surveillance,Spatio-temporal models in epidemiology',
        },
        {
          DOI: '10.1109/VAHC.2017.8387501',
          EHRs: 1,
          ISBN: '978-1-5386-3187-4',
          UMLS: ['C0679831'],
          author: ['Filip Dabek', 'Elizabeth Jimenez', 'Jesus J. Caban'],
          citation: 'Dabek2017',
          compTech: ['ML'],
          pub: '2017 IEEE workshop on visual analytics in healthcare, VAHC 2017',
          scope: ['focus'],
          term: ['EHR'],
          name: 'Timeline-based',
          title:
            'A timeline-based framework for aggregating and summarizing electronic health records',
          year: 2017,
          abstract:
            "textcopyright 2017 IEEE. Electronic Health Records (EHRs) contain a significant amount of longitudinal information about a patient including pre-existing conditions, earlier diagnosis, previous treatments, active medications, base-line measurements for different clinical results, and much more. Unfortunately, data integration within an EHR and across different EHRs continue to be a limiting factor that threatens patient safety and the efficiency of healthcare providers. The disparate nature of the clinical data even within a single EHR often results in clinicians having to access and review a number of reports, modules, and tabs to access different data elements and clinical results. Due to the fragmented nature of EHR interfaces and the number of interactions that are needed to access clinical data, clinicians often spend a considerable part of their time going through the EHR of a patient in order to get a comprehensive overview and to be able to provide quality care. Data visualization and the integration of analytic models within graphical interfaces present a unique opportunity to effectively combine multiple clinical data sources and reduce the cognitive burden that disparate reports often have for end-users. With the ability of visualization techniques to summarize different data elements, we present a timeline-based framework to effectively aggregate and summarize the disparate clinical data of a patient enclosed within an EHR. The interface combines a set of visualization techniques with machine learning summarization approaches to optimize the process of understanding a patient's history through views that allow for easily skimming and jumping through time, filters for limiting the amount of information shown, and a hierarchy of summaries that provide an interface to view and compare different time frames.",
        },
        {
          EHRs: 1,
          UMLS: ['C0021711'],
          author: [
            'Rishikesan Kamaleswaran',
            'James Edward Pugh',
            'Anirudh Thommandram',
            'Andrew James',
            'Carolyn McGregor',
          ],
          citation: 'Kamaleswaran2014',
          compTech: ['Clustering'],
          name: 'Visualizing Neonatal Spells',
          pub: 'IEEE VIS 2014 workshop on visualization of electronic health records',
          scope: ['focus'],
          term: ['EMR', 'CDS'],
          title:
            'Visualizing neonatal spells: Temporal visual analytics of high frequency cardiorespiratory physiological event streams',
          year: 2014,
        },
        {
          DOI: '10.1186/1471-2458-12-982',
          EHRs: 1,
          UMLS: ['C0032285', 'C0021400'],
          author: ['Wladimir J. Alonso', 'Benjamin J.J. McCormick'],
          citation: 'Alonso2012',
          compTech: ['GEO'],
          name: 'EPIPOI',
          notVis: true,
          pub: 'BMC Public Health',
          related: ['Carroll2014'],
          scope: ['focus'],
          term: ['Public health data', 'CDS'],
          title:
            'EPIPOI: A user-friendly analytical tool for the extraction and visualization of temporal parameters from epidemiological time series',
          year: 2012,
          abstract:
            'Background: There is an increasing need for processing and understanding relevant information generated by the systematic collection of public health data over time. However, the analysis of those time series usually requires advanced modeling techniques, which are not necessarily mastered by staff, technicians and researchers working on public health and epidemiology. Here a user-friendly tool, EPIPOI, is presented that facilitates the exploration and extraction of parameters describing trends, seasonality and anomalies that characterize epidemiological processes. It also enables the inspection of those parameters across geographic regions. Although the visual exploration and extraction of relevant parameters from time series data is crucial in epidemiological research, until now it had been largely restricted to specialists. Methods. EPIPOI is freely available software developed in Matlab (The Mathworks Inc) that runs both on PC and Mac computers. Its friendly interface guides users intuitively through useful comparative analyses including the comparison of spatial patterns in temporal parameters. Results: EPIPOI is able to handle complex analyses in an accessible way. A prototype has already been used to assist researchers in a variety of contexts from didactic use in public health workshops to the main analytical tool in published research. Conclusions: EPIPOI can assist public health officials and students to explore time series data using a broad range of sophisticated analytical and visualization tools. It also provides an analytical environment where even advanced users can benefit by enabling a higher degree of control over model assumptions, such as those associated with detecting disease outbreaks and pandemics. textcopyright 2012 Alonso and McCormick; licensee BioMed Central Ltd.',
          keywords:
            'Anomalies,Data visualization,Epidemiology,Seasonality,Time series,Trends',
        },
        {
          DOI: '10.1109/TVCG.2017.2745320',
          EHRCount: '5,804 patients',
          EHRs: 5001,
          PMID: '28866586',
          UMLS: ['C0024117'],
          author: [
            'Shunan Guo',
            'Ke Xu',
            'Rongwen Zhao',
            'David Gotz',
            'Hongyuan Zha',
            'Nan Cao',
          ],
          citation: 'Guo2018b',
          compTech: ['ESS', 'ML'],
          name: 'ET',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EHR'],
          title:
            'EventThread: Visual summarization and stage analysis of event sequence data',
          year: 2018,
          abstract:
            "Event sequence data such as electronic health records, a person's academic records, or car service records, are ordered series of events which have occurred over a period of time. Analyzing collections of event sequences can reveal common or semantically important sequential patterns. For example, event sequence analysis might reveal frequently used care plans for treating a disease, typical publishing patterns of professors, and the patterns of service that result in a well-maintained car. It is challenging, however, to visually explore large numbers of event sequences, or sequences with large numbers of event types. Existing methods focus on extracting explicitly matching patterns of events using statistical analysis to create stages of event progression over time. However, these methods fail to capture latent clusters of similar but not identical evolutions of event sequences. In this paper, we introduce a novel visualization system named EventThread which clusters event sequences into threads based on tensor analysis and visualizes the latent stage categories and evolution patterns by interactively grouping the threads by similarity into time-specific clusters. We demonstrate the effectiveness of EventThread through usage scenarios in three different application domains and via interviews with an expert user.",
          keywords:
            'Data Clustering,Illustrative Visualization,Time Series Data,Visual Knowledge Discovery,Visual Knowledge Representation',
        },
        {
          DOI: '10.1109/TVCG.2017.2745118',
          EHRs: 1001,
          UMLS: ['C0031437', 'C0872379'],
          author: [
            'Michael Glueck',
            'Mahdi Pakdaman Naeini',
            'Finale Doshi-Velez',
            'Fanny Chevalier',
            'Azam Khan',
            'Daniel Wigdor',
            'Michael Brudno',
          ],
          citation: 'Glueck2018',
          compTech: ['ML'],
          name: 'PhenoLines',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EHR'],
          title:
            'PhenoLines: Phenotype comparison visualizations for disease subtyping via topic models',
          year: 2018,
          abstract:
            'IEEE PhenoLines is a visual analysis tool for the interpretation of disease subtypes, derived from the application of topic models to clinical data. Topic models enable one to mine cross-sectional patient comorbidity data (e.g., electronic health records) and construct disease subtypes-each with its own temporally evolving prevalence and co-occurrence of phenotypes-without requiring aligned longitudinal phenotype data for all patients. However, the dimensionality of topic models makes interpretation challenging, and de facto analyses provide little intuition regarding phenotype relevance or phenotype interrelationships. PhenoLines enables one to compare phenotype prevalence within and across disease subtype topics, thus supporting subtype characterization, a task that involves identifying a proposed subtype & #x0027;s dominant phenotypes, ages of effect, and clinical validity. We contribute a data transformation workflow that employs the Human Phenotype Ontology to hierarchically organize phenotypes and aggregate the evolving probabilities produced by topic models. We introduce a novel measure of phenotype relevance that can be used to simplify the resulting topology. The design of PhenoLines was motivated by formative interviews with machine learning and clinical experts. We describe the collaborative design process, distill high-level tasks, and report on initial evaluations with machine learning experts and a medical domain expert. These results suggest that PhenoLines demonstrates promising approaches to support the characterization and optimization of topic models.',
          keywords:
            'Developmental disorder,Human Phenotype Ontology (HPO),Phenotypes,Topic models,Topology simplification',
        },
        {
          DOI: '10.1109/TVCG.2018.2865076',
          EHRs: 1,
          UMLS: ['C0011854', 'C0599880'],
          author: ['Yixuan Zhang', 'Kartik Chanana', 'Cody Dunne'],
          citation: 'Zhang2019a',
          compTech: ['Comparison'],
          name: 'IDMVis',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title:
            'IDMVis: Temporal event sequence visualization for type 1 diabetes treatment decision support',
          year: 2019,
          abstract:
            'Type 1 diabetes is a chronic, incurable autoimmune disease affecting millions of Americans in which the body stops producing insulin and blood glucose levels rise. The goal of intensive diabetes management is to lower average blood glucose through frequent adjustments to insulin protocol, diet, and behavior. Manual logs and medical device data are collected by patients, but these multiple sources are presented in disparate visualization designs to the clinician-making temporal inference difficult. We conducted a design study over 18 months with clinicians performing intensive diabetes management. We present a data abstraction and novel hierarchical task abstraction for this domain. We also contribute IDMVis: a visualization tool for temporal event sequences with multidimensional, interrelated data. IDMVis includes a novel technique for folding and aligning records by dual sentinel events and scaling the intermediate timeline. We validate our design decisions based on our domain abstractions, best practices, and through a qualitative evaluation with six clinicians. The results of this study indicate that IDMVis accurately reflects the workflow of clinicians. Using IDMVis, clinicians are able to identify issues of data quality such as missing or conflicting data, reconstruct patient records when data is missing, differentiate between days with different patterns, and promote educational interventions after identifying discrepancies.',
          keywords:
            'Design study,event sequence visualization,health applications,qualitative evaluation,task analysis,time series data',
        },
        {
          DOI: '10.1111/cgf.12909',
          EHRs: 2,
          UMLS: ['C0021711'],
          author: [
            'Rishikesan Kamaleswaran',
            'Christopher Collins',
            'Andrew James',
            'Carolyn McGregor',
          ],
          citation: 'Kamaleswaran2016a',
          compTech: ['Clustering'],
          name: 'PhysioEx',
          pub: 'Computer Graphics Forum',
          scope: ['focus'],
          term: ['EMR', 'CDS'],
          title: 'PhysioEx: Visual analysis of physiological event streams',
          year: 2016,
          abstract:
            'textcopyright 2016 The Author(s) Computer Graphics Forum textcopyright 2016 The Eurographics Association and John Wiley & Sons Ltd. Published by John Wiley & Sons Ltd. In this work, we introduce a novel visualization technique, the Temporal Intensity Map, which visually integrates data values over time to reveal the frequency, duration, and timing of significant features in streaming data. We combine the Temporal Intensity Map with several coordinated visualizations of detected events in data streams to create PhysioEx, a visual dashboard for multiple heterogeneous data streams. We have applied PhysioEx in a design study in the field of neonatal medicine, to support clinical researchers exploring physiologic data streams. We evaluated our method through consultations with domain experts. Results show that our tool provides deep insight capabilities, supports hypothesis generation, and can be well integrated into the workflow of clinical researchers.',
          keywords:
            'Categories and Subject Descriptors (according to A,H.5.2 [Information Interfaces and Presentation]: U,J.3 [Life and Medical Sciences]: Medical informati',
        },
        {
          DOI: '10.1093/jamia/ocx070',
          EHRs: 101,
          PMID: '29016825',
          UMLS: ['C0009378'],
          author: [
            'Gaurav Trivedi',
            'Phuong Pham',
            'Wendy W Chapman',
            'Rebecca Hwa',
            'Janyce Wiebe',
            'Harry Hochheiser',
          ],
          citation: 'Trivedi2018',
          compTech: ['NLP', 'ML'],
          name: 'NLPReViz',
          notVis: true,
          pub: 'Journal of the American Medical Informatics Association : JAMIA',
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title:
            'NLPReViz: an interactive tool for natural language processing on clinical text.',
          year: 2018,
          abstract:
            'The gap between domain experts and natural language processing expertise is a barrier to extracting understanding from clinical text. We describe a prototype tool for interactive review and revision of natural language processing models of binary concepts extracted from clinical notes. We evaluated our prototype in a user study involving 9 physicians, who used our tool to build and revise models for 2 colonoscopy quality variables. We report changes in performance relative to the quantity of feedback. Using initial training sets as small as 10 documents, expert review led to final F1scores for the "appendiceal-orifice" variable between 0.78 and 0.91 (with improvements ranging from 13.26% to 29.90%). F1for "biopsy" ranged between 0.88 and 0.94 (-1.52% to 11.74% improvements). The average System Usability Scale score was 70.56. Subjective feedback also suggests possible design improvements.',
          keywords:
            'electronic health records,machine learning,medical informatics,natural language processing (NLP),user-computer interface',
        },
        {
          DOI: '10.2312/eurova.20151108',
          EHRs: 2,
          UMLS: ['C0004238', 'C0085207', 'C5204342'],
          author: [
            'Paolo Federico',
            'Jürgen Unger',
            'Albert Amor-Amorós',
            'Lucia Sacchi',
            'Denis Klimov',
            'Silvia Miksch',
          ],
          citation: 'Federico2015',
          compTech: ['Comparison'],
          name: 'Gnaeus',
          pub: 'EuroVis Workshop on Visual Analytics',
          related: ['Rind2017a'],
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title:
            'Gnaeus : utilizing clinical guidelines for knowledge-assisted visualisation of EHR cohorts',
          year: 2015,
        },
        {
          DOI: '10.1109/TVCG.2014.2346682',
          EHRCount: '2,899 patients',
          EHRs: 1001,
          UMLS: ['C0262926'],
          author: ['David Gotz', 'Harry Stavropoulos'],
          citation: 'Gotz2014',
          compTech: ['ESS'],
          name: 'DecisionFlow',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EMR'],
          title:
            'DecisionFlow: Visual analytics for high-dimensional temporal event sequence data',
          year: 2014,
          abstract:
            'Temporal event sequence data is increasingly commonplace, with applications ranging from electronic medical records to financial transactions to social media activity. Previously developed techniques have focused on low-dimensional datasets (e.g., with less than 20 distinct event types). Real-world datasets are often far more complex. This paper describes DecisionFlow, a visual analysis technique designed to support the analysis of high-dimensional temporal event sequence data (e.g., thousands of event types). DecisionFlow combines a scalable and dynamic temporal event data structure with interactive multi-view visualizations and ad hoc statistical analytics. We provide a detailed review of our methods, and present the results from a 12-person user study. The study results demonstrate that DecisionFlow enables the quick and accurate completion of a range of sequence analysis tasks for datasets containing thousands of event types and millions of individual events.',
          keywords:
            'Flow Diagrams,Information Visualization,Medical Informatics,Temporal Event Sequences,Visual Analytics',
        },
        {
          DOI: '10.1109/TVCG.2013.200',
          EHRs: 101,
          UMLS: ['C0031330'],
          author: [
            'Megan Monroe',
            'Rongjian Lan',
            'Hanseung Lee',
            'Catherine Plaisant',
            'Ben Shneiderman',
          ],
          citation: 'Monroe2013',
          compTech: ['ESS'],
          name: 'EventFlow',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          related: ['Rind2013', 'West2015', 'Onukwugha2016'],
          scope: ['focus'],
          term: ['EHR'],
          title: 'Temporal event sequence simplification',
          year: 2013,
          abstract:
            'Electronic Health Records (EHRs) have emerged as a cost-effective data source for conducting medical research. The difficulty in using EHRs for research purposes, however, is that both patient selection and record analysis must be conducted across very large, and typically very noisy datasets. Our previous work introduced EventFlow, a visualization tool that transforms an entire dataset of temporal event records into an aggregated display, allowing researchers to analyze population-level patterns and trends. As datasets become larger and more varied, however, it becomes increasingly difficult to provide a succinct, summarizing display. This paper presents a series of user-driven data simplifications that allow researchers to pare event records down to their core elements. Furthermore, we present a novel metric for measuring visual complexity, and a language for codifying disjoint strategies into an overarching simplification framework. These simplifications were used by real-world researchers to gain new and valuable insights from initially overwhelming datasets.',
          keywords:
            'Event sequences,electronic heath records,simplification,temporal query',
        },
        {
          DOI: '10.1145/989863.989889',
          EHRs: 1,
          ISBN: '1-58113-867-9',
          UMLS: ['C0030677'],
          author: [
            'Dina Goren-Bar',
            'Yuval Shahar',
            'Maya Galperin-Aizenberg',
            'David Boaz',
            'Gil Tahan',
          ],
          citation: 'Goren-Bar2004',
          name: 'KNAVE-II',
          pub: "Proceedings of the working conference on Advanced visual interfaces - AVI '04",
          related: ['Roque2010', 'Rind2013', 'West2015'],
          scope: ['context'],
          term: ['Time-oriented clinical data', 'CDS'],
          title:
            'Knave II: The definition and implementation of an intelligent tool for visualization and exploration of time-oriented clinical data',
          year: 2004,
          abstract:
            'KNAVE-II is an intelligent interface to a distributed web-based architecture that enables users (e.g., physicians) to query, visualize and explore clinical time-oriented databases. Based on prior studies, we have defined a set of requirements for provision of a service for interactive exploration of time oriented clinical data. The main requirements include the visualization, interactive exploration and explanation of both raw data and multiple levels of concepts abstracted from these data; the exploration of clinical data at different levels of temporal granularity along both absolute (calendar-based) and relative (clinically meaningful) time-lines; the exploration and dynamic visualization of the effects of simulated hypothetical modifications of raw data on the derived concepts; and the provision of generic services (such as statistics, documentation, fast search and retrieval of clinically significant concepts, amongst others). KNAVE-II has been implemented and is currently evaluated by expert clinicians in several medical domains, such as oncology, involving monitoring of chronic patients. textcopyright 2004 ACM.',
          keywords:
            'Clinical systems,Human-computer interaction,Intelligent visualization,Knowledge-based systems,Medical informatics,Temporal abstraction,Temporal reasoning',
        },
        {
          DOI: '10.1109/TVCG.2018.2864905',
          EHRs: 2,
          UMLS: ['C0010337', 'C0262926'],
          author: [
            'Nicole Sultanum',
            'Devin Singh',
            'Michael Brudno',
            'Fanny Chevalier',
          ],
          citation: 'Sultanum2019',
          compTech: ['NLP'],
          name: 'Doccurate',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EMR', 'CDS'],
          title:
            'Doccurate: A curation-based approach for clinical text visualization',
          year: 2019,
          abstract:
            "Before seeing a patient, physicians seek to obtain an overview of the patient's medical history. Text plays a major role in this activity since it represents the bulk of the clinical documentation, but reviewing it quickly becomes onerous when patient charts grow too large. Text visualization methods have been widely explored to manage this large scale through visual summaries that rely on information retrieval algorithms to structure text and make it amenable to visualization. However, the integration with such automated approaches comes with a number of limitations, including significant error rates and the need for healthcare providers to fine-tune algorithms without expert knowledge of their inner mechanics. In addition, several of these approaches obscure or substitute the original clinical text and therefore fail to leverage qualitative and rhetorical flavours of the clinical notes. These drawbacks have limited the adoption of text visualization and other summarization technologies in clinical practice. In this work we present Doccurate, a novel system embodying a curation-based approach for the visualization of large clinical text datasets. Our approach offers automation auditing and customizability to physicians while also preserving and extensively linking to the original text. We discuss findings of a formal qualitative evaluation conducted with 6 domain experts, shedding light onto physicians' information needs, perceived strengths and limitations of automated tools, and the importance of customization while balancing efficiency. We also present use case scenarios to showcase Doccurate's envisioned usage in practice.",
          keywords:
            'Clinical Text,Medical Narrative,Text Visualization,Visual Curation',
        },
        {
          DOI: '10.1109/MCG.2015.49',
          EHRCount: 'about 16,000 patients',
          EHRs: 5001,
          UMLS: ['C0600139', 'C0679831'],
          author: [
            'Jürgen Bernard',
            'David Sessler',
            'Thorsten May',
            'Thorsten Schlomm',
            'Dirk Pehrke',
            'Jörn Kohlhammer',
          ],
          citation: 'Bernard2015a',
          compTech: ['Comparison'],
          pub: 'IEEE Computer Graphics and Applications',
          related: ['Onukwugha2016', 'Preim2020'],
          scope: ['focus'],
          term: ['EHR'],
          title:
            'A visual-interactive system for prostate cancer cohort analysis',
          year: 2015,
          abstract:
            "textcopyright 2015 IEEE. A long-term goal in prostate cancer research is a sound prognosis prior to surgery, and as a consequence, data-centered research is becoming increasingly important. Currently, it takes several days to define meaningful cohorts by manually selecting patients from health record systems and performing statistical hypothesis tests with cohorts. The authors developed an efficient and effective visual-interactive system for the definition and analysis of patient cohorts. The system provides an overview of large sets of patient records and allows medical researchers to interactively drill down to relevant patient cohorts. In addition, a guidance concept helps them identify interesting relations between defined cohorts and rich sets of attributes available in the patient records. The system increases the efficiency of the researchers' analytical workflow by reducing the temporal effort from days to minutes.",
          keywords:
            'cancer research,computer graphics,hypotheses generation,hypotheses validation,information visualization,patient cohorts,visual analytics',
        },
        {
          DOI: '10.1109/TVCG.2018.2803829',
          EHRCount: 'almost 2,000 patients',
          EHRs: 1001,
          UMLS: ['C0600139'],
          author: [
            'Jurgen Bernard',
            'David Sessler',
            'Jorn Kohlhammer',
            'Roy A. Ruddle',
          ],
          citation: 'Bernard2019',
          name: 'Dashboard Networks',
          compTech: ['ESS'],
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title:
            'Using dashboard networks to visualize multiple patient histories: A design study on post-operative prostate cancer',
          year: 2019,
          abstract:
            'IEEE In this design study, we present a visualization technique that segments patients&#x0027; histories instead of treating them as raw event sequences, aggregates the segments using criteria such as the whole history or treatment combinations, and then visualizes the aggregated segments as static dashboards that are arranged in a dashboard network to show longitudinal changes. The static dashboards were developed in nine iterations, to show 15 important attributes from the patients&#x0027; histories. The final design was evaluated with five non-experts, five visualization experts and four medical experts, who successfully used it to gain an overview of a 2,000 patient dataset, and to make observations about longitudinal changes and differences between two cohorts. The research represents a step-change in the detail of large-scale data that may be successfully visualized using dashboards, and provides guidance about how the approach may be generalized.',
          keywords:
            'Information visualization,dashboard network,design study,electronic health care records,evaluation,medical data analysis,multivariate data visualization,prostate cancer disease,static dashboard,user study,visual analytics',
        },
        {
          EHRs: 1,
          name: 'Radial coordinates',
          UMLS: ['C0684249'],
          author: ['David Borland', 'Vivian L West', 'W Ed Hammond'],
          citation: 'Borland2014',
          compTech: ['Comparison'],
          pub: 'Proceedings of the 2014 Workshop on Visual Analytics in Healthcare',
          related: ['Gotz2016'],
          scope: ['focus'],
          term: ['Population health'],
          title:
            'Multivariate visualization of system-wide national health service data using radial coordinates',
          year: 2014,
          abstract:
            "We present radial coordinates, a multivariate visualization technique based on parallel coordinates. The visualization contains a number of features driven by the needs of health-related data analysis, such as integrating categorical and numeric data, and comparing user-selected subpopulations via ribbon rendering. We illustrate the utility of radial coordinates by exploring primary care trust (PCT) and practice-level data from the United Kingdom's National Health Service, using three examples: lung cancer rates among PCTs, various cancer rates among only London suburb PCTs, and medical problem prevalence among over 1500 London practices.",
        },
        {
          DOI: '10.1145/985692.985706',
          EHRs: 1,
          ISBN: '1-58113-702-8',
          UMLS: ['C0010337', 'C0034065', 'C0599880'],
          author: ['Ragnar Bade', 'Stefan Schlechtweg', 'Silvia Miksch'],
          citation: 'Bade2004',
          name: 'Midgaard',
          notVis: true,
          pub: "Proceedings of the 2004 conference on Human factors in computing systems - CHI '04",
          related: ['Rind2013'],
          scope: ['context'],
          term: ['EHR'],
          title:
            'Connecting time-oriented data and information to a coherent interactive visualization',
          year: 2004,
          abstract:
            'In modern intensive care units (ICUs), the medical staff has to monitor a huge amount of high-dimensional and time-oriented data, which needs to be visualized user- and task-specifically to ease diagnosis and treatment planning. Available visual representations, like diagrams or charts neglect the implicit information as well as a-priory or associated knowledge about the data and its meaning (for example, 38.5°C (101.3°F) is moderate fever and 41°C (105.8°F) is critical fever). Another challenge is to provide appropriate interaction techniques to explore and navigate the data and its temporal dimensions. In this context one major challenge is to connect time-oriented data and information to a coherent interactive visualization. In this paper we present different interactive visualization techniques which enable the users to reveal the data at several levels of detail and abstraction, ranging from a broad overview to the fine structure. We will also introduce a time visualization and navigation technique that connects overview+detail, pan+zoom, and focus+context features to one powerful time-browser.',
          keywords:
            'Health care,Information visualization,Medical application: intensive care units,Temporal data modeling and abstraction,User interface design,Visualization',
        },
        {
          EHRs: 1,
          UMLS: ['C0262926'],
          author: [
            'Zhiyuan Zhang',
            'Faisal Ahmed',
            'Arunesh Mittal',
            'Iv Ramakrishnan',
            'Rong Zhao',
            'Asa Viccellio',
            'Klaus Mueller',
          ],
          citation: 'Zhang2011',
          compTech: ['NLP'],
          name: 'AnamneVis',
          pub: 'IEEE VAHC Workshop',
          scope: ['focus'],
          term: ['EHR'],
          title:
            'AnamneVis: a framework for the visualization of patient history and medical diagnostics chains',
          year: 2011,
          abstract:
            "The medical history or anamnesis of a patient is the factual information obtained by a physician for the medical diagnostics of a patient. This information includes current symptoms, history of present illness, previous treatments, available data, current medications, past history, family history, and others. Based on this information the physician follows through a medical diagnostics chain that includes requests for further data, diagnosis, treatment, follow-up, and eventually a report of treatment outcome. Patients often have rather complex medical histories, and visualization and visual analytics can offer large benefits for the navigation and reasoning with this information. Here we present AnamneVis, a system where the patient is represented as a radial sunburst visualization that captures all health conditions of the past and present to serve as a quick overview to the interrogating physician. The patient's body is represented as a stylized body map that can be zoomed into for further anatomical detail. On the other hand, the reasoning chain is represented as a multi-stage flow chart, composed of date, symptom, data, diagnosis, treatment, and outcome.",
        },
        {
          EHRs: 1001,
          UMLS: ['C3242284'],
          author: [
            'Chao Tong',
            'Richard Roberts',
            'Robert S. Laramee',
            'Damon Berridge',
            'Daniel Thayer',
          ],
          citation: 'Tong2017b',
          compTech: ['GEO'],
          name: 'Cartographic Treemaps',
          pub: 'Computer graphics & visual computing',
          scope: ['focus'],
          term: ['Public healthcare data'],
          title:
            'Cartographic treemaps for visualization of public healthcare data',
          year: 2017,
        },
        {
          DOI: '10.1109/TVCG.2018.2864885',
          EHRCount: '46,251 patients',
          EHRs: 5001,
          UMLS: ['C0010337'],
          author: [
            'Shunan Guo',
            'Zhuochen Jin',
            'David Gotz',
            'Fan Du',
            'Hongyuan Zha',
            'Nan Cao',
          ],
          citation: 'Guo2019',
          compTech: ['ESS', 'ML'],
          name: 'ET2',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EHR'],
          title: 'Visual progression analysis of event sequence data',
          year: 2019,
          abstract:
            'Event sequence data is common to a broad range of application domains, from security to health care to scholarly communication. This form of data captures information about the progression of events for an individual entity (e.g., a computer network device; a patient; an author) in the form of a series of time-stamped observations. Moreover, each event is associated with an event type (e.g., a computer login attempt, or a hospital discharge). Analyses of event sequence data have been shown to help reveal important temporal patterns, such as clinical paths resulting in improved outcomes, or an understanding of common career trajectories for scholars. Moreover, recent research has demonstrated a variety of techniques designed to overcome methodological challenges such as large volumes of data and high dimensionality. However, the effective identification and analysis of latent stages of progression, which can allow for variation within different but similarly evolving event sequences, remain a significant challenge with important real-world motivations. In this paper, we propose an unsupervised stage analysis algorithm to identify semantically meaningful progression stages as well as the critical events which help define those stages. The algorithm follows three key steps: (1) event representation estimation, (2) event sequence warping and alignment, and (3) sequence segmentation. We also present a novel visualization system, ET2, which interactively illustrates the results of the stage analysis algorithm to help reveal evolution patterns across stages. Finally, we report three forms of evaluation for ET2: (1) case studies with two real-world datasets, (2) interviews with domain expert users, and (3) a performance evaluation on the progression analysis algorithm and the visualization design.',
          keywords: 'Event Sequence Data,Progression Analysis,Visual Analysis',
        },
        {
          DOI: '10.1109/TVCG.2009.187',
          EHRs: 101,
          UMLS: ['C0040034'],
          author: [
            'Taowei David Wang',
            'Catherine Plaisant',
            'Ben Shneiderman',
            'Neil Spring',
            'David Roseman',
            'Greg Marchand',
            'Vikramjit Mukherjee',
            'Mark Smith',
          ],
          citation: 'Wang2009',
          compTech: ['ESS'],
          name: 'LifeLines 2',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          related: ['Roque2010', 'Rind2013', 'West2015', 'Simpao2014'],
          scope: ['context'],
          term: ['EHR'],
          title:
            'Temporal summaries: Supporting temporal categorical searching, aggregation and comparison',
          year: 2009,
          abstract:
            'When analyzing thousands of event histories, analysts often want to see the events as an aggregate to detect insights and generate new hypotheses about the data. An analysis tool must emphasize both the prevalence and the temporal ordering of these events. Additionally, the analysis tool must also support flexible comparisons to allow analysts to gather visual evidence. In a previsous work, we introduced align, rank, and filter (ARF) to accentuate temporal ordering. In this paper, we present temporal summaries, an interactive visualization technique that highlights the prevalence of event occurrences. Temporal summaries dynamically aggregate events in multiple granularities (year, month, week, day, hour, etc.) for the purpose of spotting trends over time and comparing several groups of records. They provide affordances for analysts to perform temporal range filters. We demonstrate the applicability of this approach in two extensive case studies with analysts who applied temporal summaries to search, filter, and look for patterns in electronic health records and academic records. textcopyright 2009 IEEE.',
          keywords:
            'Human-computer interaction,Information Visualization,Interaction design,temporal categorical data visualization',
        },
        {
          DOI: '10.3390/info10100302',
          EHRs: 1001,
          UMLS: ['C3242284'],
          author: ['Liam McNabb', 'Robert S. Laramee'],
          citation: 'McNabb2019',
          name: 'Multivariate Maps',
          compTech: ['GEO'],
          pub: 'Information',
          scope: ['focus'],
          term: ['Population health data'],
          title:
            'Multivariate Maps—A glyph-placement algorithm to support multivariate geospatial visualization',
          year: 2019,
          abstract:
            'Maps are one of the most conventional types of visualization used when conveying information to both inexperienced users and advanced analysts. However, the multivariate representation of data on maps is still considered an unsolved problem. We present a multivariate map that uses geo-space to guide the position of multivariate glyphs and enable users to interact with the map and glyphs, conveying meaningful data at different levels of detail. We develop an algorithm pipeline for this process and demonstrate how the user can adjust the level-of-detail of the resulting imagery. The algorithm features a unique combination of guided glyph placement, level-of-detail, dynamic zooming, and smooth transitions. We present a selection of user options to facilitate the exploration process and provide case studies to support how the application can be used. We also compare our placement algorithm with previous geo-spatial glyph placement algorithms. The result is a novel glyph placement solution to support multi-variate maps.',
          keywords:
            'Glyphs,Information visualization,Level-of-detail,Multivariate maps',
        },
        {
          DOI: '10.1109/TVCG.2015.2467325',
          EHRs: 101,
          UMLS: ['C0038454'],
          author: [
            'Mona Hosseinkhani Loorak',
            'Charles Perin',
            'Noreen Kamal',
            'Michael Hill',
            'Sheelagh Carpendale',
          ],
          citation: 'Loorak2016',
          compTech: ['ESS', 'Comparison'],
          name: 'TimeSpan',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title:
            'TimeSpan: Using visualization to explore temporal multi-dimensional data of stroke patients',
          year: 2016,
          abstract:
            'textcopyright 1995-2012 IEEE. We present TimeSpan, an exploratory visualization tool designed to gain a better understanding of the temporal aspects of the stroke treatment process. Working with stroke experts, we seek to provide a tool to help improve outcomes for stroke victims. Time is of critical importance in the treatment of acute ischemic stroke patients. Every minute that the artery stays blocked, an estimated 1.9 million neurons and 12 km of myelinated axons are destroyed. Consequently, there is a critical need for efficiency of stroke treatment processes. Optimizing time to treatment requires a deep understanding of interval times. Stroke health care professionals must analyze the impact of procedures, events, and patient attributes on time - ultimately, to save lives and improve quality of life after stroke. First, we interviewed eight domain experts, and closely collaborated with two of them to inform the design of TimeSpan. We classify the analytical tasks which a visualization tool should support and extract design goals from the interviews and field observations. Based on these tasks and the understanding gained from the collaboration, we designed TimeSpan, a web-based tool for exploring multi-dimensional and temporal stroke data. We describe how TimeSpan incorporates factors from stacked bar graphs, line charts, histograms, and a matrix visualization to create an interactive hybrid view of temporal data. From feedback collected from domain experts in a focus group session, we reflect on the lessons we learned from abstracting the tasks and iteratively designing TimeSpan.',
          keywords:
            'Computed tomography,Data visualization,Delays,Hospitals,Interviews,Needles,Visualization',
        },
        {
          DOI: '10.1109/PACIFICVIS.2011.5742371',
          EHRs: 1,
          ISBN: '978-1-61284-932-4',
          UMLS: ['C0441472', 'C0599880'],
          author: [
            'Theresia Gschwandtner',
            'Wolfgang Aigner',
            'Katharina Kaiser',
            'Silvia Miksch',
            'Andreas Seyfang',
          ],
          citation: 'Gschwandtner2011',
          compTech: ['Comparison'],
          elated: ['Rind2013', 'Rind2017a', 'Preim2020'],
          name: 'CareCruiser',
          pub: 'IEEE pacific visualization symposium 2011, PacificVis 2011 - proceedings',
          scope: ['focus'],
          term: ['Patient record', 'CDS'],
          title:
            'CareCruiser: Exploring and visualizing plans, events, and effects interactively',
          year: 2011,
          abstract:
            "In recent years, sophisticated visualization methods have been developed to support both, the logical structure and the time-oriented aspects of computer-executable clinical treatment plans. However, visualizing the effects of applying treatment plans as well as supporting the exploration of effects on the patient's condition are still largely unresolved tasks. To fill this gap, we have developed a prototype that enhances known visualization methods to communicate the processes of treatment plan application together with their effects on a patient's condition in an easily understandable way. Our prototype combines the advantages of enhanced visual recognition of patterns with traditional information of parameters' development. Thus, it provides means (1) to assess success or failure of previously applied treatment plans, (2) to explore the effects of each applied clinical action on the patient's condition, and (3) to identify sub-optimal treatment choices. These means help physicians to optimize their treatment choices and enable developers of clinical practice guidelines (CPGs) to investigate and readjust these treatment plans. textcopyright 2011 IEEE.",
          keywords:
            'H.5.m [Information Systems]: Information Interface,I.3.6 [Computing Methodologies]: Computer Graphics,J.3 [Computer Applications]: Life and Medical Scie',
        },
        {
          DOI: '10.1016/B978-155860915-0/50038-X',
          EHRs: 1,
          PMID: '9929185',
          UMLS: ['C0679831'],
          author: [
            'Catherine Plaisant',
            'Richard Mushlin',
            'Aaron Snyder',
            'Jia Li',
            'Dan Heller',
            'Ben Shneiderman',
          ],
          citation: 'Plaisant1998a',
          name: 'LifeLines',
          notVis: true,
          pub: 'Proceedings. AMIA Symposium',
          related: ['Roque2010', 'Rind2013', 'West2015', 'Onukwugha2016'],
          scope: ['context'],
          term: ['Computerized patient records'],
          title:
            'LifeLines: using visualization to enhance navigation and analysis of patient records.',
          year: 1998,
          abstract:
            'LifeLines provide a general visualization environment for personal histories. We explore its use for clinical patient records. A Java user interface is described, which presents a one-screen overview of a computerized patient record using timelines. Problems, diagnoses, test results or medications can be represented as dots or horizontal lines. Zooming provides more details; line color and thickness illustrate relationships or significance. The visual display acts as a giant menu, giving direct access to the data.',
        },
        {
          DOI: '10.1109/VAST.2006.261421',
          EHRCount: '950 patients, over 26,000 EHRs',
          EHRs: 5001,
          ISBN: '1-4244-0591-2',
          UMLS: ['C0262926'],
          author: [
            'Jerry Fails',
            'Amy Karlson',
            'Layla Shahamat',
            'Ben Shneiderman',
          ],
          citation: 'Fails2006',
          compTech: ['ESS'],
          name: 'PatternFinder',
          pub: '2006 IEEE symposium on visual analytics and technology',
          related: ['Rind2013'],
          scope: ['context'],
          term: ['Personal medical history'],
          title:
            'A visual interface for multivariate temporal data: Finding patterns of events across multiple histories',
          year: 2006,
          abstract:
            "Finding patterns of events over time is important in searching patient histories, web logs, news stories, and criminal activities. This paper presents PatternFinder, an integrated interface for query and result-set visualization for search and discovery of temporal patterns within multivariate and categorical data sets. We define temporal patterns as sequences of events with interevent time spans. PatternFinder allows users to specify the attributes of events and time spans to produce powerful pattern queries that are difficult to express with other formalisms. We characterize the range of queries PatternFinder supports as users vary the specificity at which events and time spans are defined. Pattern Finder's query capabilities together with coupled ball-and-chain and tabular visualizations enable users to effectively query, explore and analyze event patterns both within and across data entities (e.g. patient histories, terrorist groups, web logs, etc.). textcopyright 2006 IEEE.",
          keywords: 'Information visualization,Temporal query,User interface',
        },
        {
          DOI: '10.3217/jucs-011-11-1792',
          EHRs: 2,
          UMLS: ['C0003125'],
          author: [
            'Klaus Hinum',
            'Silvia Miksch',
            'Wolfgang Aigner',
            'Susanne Ohmann',
            'Christian Popow',
            'Margit Pohl',
            'Markus Rester',
          ],
          citation: 'Hinum2005',
          name: 'Gravi++',
          notVis: true,
          pub: 'Journal of Universal Computer Science',
          related: ['Rind2013', 'Rind2017a'],
          scope: ['context'],
          term: ['Medical data'],
          title:
            'Gravi++: Interactive information visualization to explore highly structured temporal data',
          year: 2005,
          abstract:
            'Tracking and comparing psychotherapeutic data derived from questionnaires involves a number of highly structured, time-oriented parameters. Descriptive and other statistical methods are only suited for partial analysis. Therefore, we created a novel spring-based interactive Information Visualization method for analysing these data more in-depth. With our method the user is able to find new predictors for a positive or negative course of the therapy due to the combination of various visualization and interaction methods. textcopyright J.UCS.',
          keywords:
            'Interactive information visualization,Medical domain,Temporal data',
        },
        {
          DOI: '10.1109/TVCG.2016.2598469',
          EHRs: 2,
          UMLS: ['C0031437'],
          author: [
            'Michael Glueck',
            'Alina Gvozdik',
            'Fanny Chevalier',
            'Azam Khan',
            'Michael Brudno',
            'Daniel Wigdor',
          ],
          citation: 'Glueck2017',
          compTech: ['NLP'],
          name: 'PhenoStacks',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EHR'],
          title:
            'PhenoStacks: Cross-sectional cohort phenotype comparison visualizations',
          year: 2017,
          abstract:
            'textcopyright 2016 IEEE. Cross-sectional phenotype studies are used by genetics researchers to better understand how phenotypes vary across patients with genetic diseases, both within and between cohorts. Analyses within cohorts identify patterns between phenotypes and patients (e.g., co-occurrence) and isolate special cases (e.g., potential outliers). Comparing the variation of phenotypes between two cohorts can help distinguish how different factors affect disease manifestation (e.g., causal genes, age of onset, etc.). PhenoStacks is a novel visual analytics tool that supports the exploration of phenotype variation within and between cross-sectional patient cohorts. By leveraging the semantic hierarchy of the Human Phenotype Ontology, phenotypes are presented in context, can be grouped and clustered, and are summarized via overviews to support the exploration of phenotype distributions. The design of PhenoStacks was motivated by formative interviews with genetics researchers: we distil high-level tasks, present an algorithm for simplifying ontology topologies for visualization, and report the results of a deployment evaluation with four expert genetics researchers. The results suggest that PhenoStacks can help identify phenotype patterns, investigate data quality issues, and inform data collection design.',
          keywords:
            'Cross-sectional cohort analysis,Human Phenotype Ontology (HPO),Phenotypes',
        },
        {
          DOI: '10.1109/TVCG.2020.2985689',
          EHRs: 101,
          UMLS: ['C0011854', 'C0020179', 'C0030567'],
          author: [
            'Bum Chul Kwon',
            'Vibha Anand',
            'Kristen A. Severson',
            'Soumya Ghosh',
            'Zhaonan Sun',
            'Brigitte I. Frohnert',
            'Markus Lundgren',
            'Kenney Ng',
          ],
          citation: 'Kwon2020',
          compTech: ['ML'],
          name: 'DPVis',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EMR'],
          title:
            'DPVis: Visual analytics with hidden markov models for disease progression pathways',
          year: 2020,
          abstract:
            "Clinical researchers use disease progression models to understand patient status and characterize progression patterns from longitudinal health records. One approach for disease progression modeling is to describe patient status using a small number of states that represent distinctive distributions over a set of observed measures. Hidden Markov models (HMMs) and its variants are a class of models that both discover these states and make inferences of health states for patients. Despite the advantages of using the algorithms for discovering interesting patterns, it still remains challenging for medical experts to interpret model outputs, understand complex modeling parameters, and clinically make sense of the patterns. To tackle these problems, we conducted a design study with clinical scientists, statisticians, and visualization experts, with the goal to investigate disease progression pathways of chronic diseases, namely type 1 diabetes (T1D), Huntington's disease, Parkinson's disease, and chronic obstructive pulmonary disease (COPD). As a result, we introduce DPVis which seamlessly integrates model parameters and outcomes of HMMs into interpretable and interactive visualizations. In this study, we demonstrate that DPVis is successful in evaluating disease progression models, visually summarizing disease states, interactively exploring disease progression patterns, and building, analyzing, and comparing clinically relevant patient subgroups.",
          keywords:
            'Analytical models,Data models,Data visualization,Diabetes,Disease Progression,Diseases,Hidden Markov Model,Hidden Markov models,Huntingtons,Interpretability,Parkinsons,State Space Model,Task analysis',
        },
        {
          DOI: '10.1109/TVCG.2018.2865027',
          EHRCount: '1.4 million patients',
          EHRs: 100000,
          UMLS: ['C0011854', 'C0020443', 'C0020538', 'C0262926'],
          author: [
            'Bum Chul Kwon',
            'Min Je Choi',
            'Joanne Taery Kim',
            'Edward Choi',
            'Young Bin Kim',
            'Soonwook Kwon',
            'Jimeng Sun',
            'Jaegul Choo',
          ],
          citation: 'Kwon2019',
          compTech: ['ML'],
          name: 'RetainVis',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EMR', 'CDS'],
          title:
            'RetainVis: Visual analytics with interpretable and interactive recurrent neural networks on electronic medical records',
          year: 2019,
          abstract:
            "We have recently seen many successful applications of recurrent neural networks (RNNs) on electronic medical records (EMRs), which contain histories of patients' diagnoses, medications, and other various events, in order to predict the current and future states of patients. Despite the strong performance of RNNs, it is often challenging for users to understand why the model makes a particular prediction. Such black-box nature of RNNs can impede its wide adoption in clinical practice. Furthermore, we have no established methods to interactively leverage users' domain expertise and prior knowledge as inputs for steering the model. Therefore, our design study aims to provide a visual analytics solution to increase interpretability and interactivity of RNNs via a joint effort of medical experts, artificial intelligence scientists, and visual analytics researchers. Following the iterative design process between the experts, we design, implement, and evaluate a visual analytics tool called RetainVis, which couples a newly improved, interpretable and interactive RNN-based model called RetainEX and visualizations for users' exploration of EMR data in the context of prediction tasks. Our study shows the effective use of RetainVis for gaining insights into how individual medical codes contribute to making risk predictions, using EMRs of patients with heart failure and cataract symptoms. Our study also demonstrates how we made substantial changes to the state-of-the-art RNN model called RETAIN in order to make use of temporal information and increase interactivity. This study will provide a useful guideline for researchers that aim to design an interpretable and interactive visual analytics tool for RNNs.",
          keywords:
            'Healthcare,Interactive Artificial Intelligence,Interpretable Deep Learning,XAI (Explainable Artificial Intelligence)',
        },
        {
          DOI: '10.1055/s-0038-1634202',
          EHRs: 2,
          PMID: '11776741',
          UMLS: ['C0010337', 'C0021711'],
          author: ['Werner Horn', 'Christian Popow', 'Lukas Unterasinger'],
          citation: 'Horn2001',
          name: 'VIE-VISU',
          pub: 'Methods of Information in Medicine',
          related: ['Rind2013'],
          scope: ['context'],
          term: ['EHR'],
          title:
            'Support for fast comprehension of ICU data: Visualization using metaphor graphics',
          year: 2001,
          abstract:
            "Objectives: The time-oriented analysis of electronic patient records on (neonatal) intensive care units is a tedious and time-consuming task. Graphic data visualization should make it easier for physicians to assess the overall situation of a patient and to recognize essential changes over time. Methods: Metaphor graphics are used to sketch the most relevant parameters for characterizing a patient's situation. By repetition of the graphic object in 24 frames the situation of the ICU patient is presented in one display, usually summarizing the last 24h. Results: VIE-VISU is a data visualization system which uses multiples to present the change in the patient's status over time in graphic form. Each multiple is a highly structured metaphor graphic object. Each object visualizes important ICU porameters from circulation, ventilation, and fluid balance. Conclusion: The design using multiples promotes a focus on stability and change. A stable patient is recognizable at first sight, continuous improvement or worsening condition are easy to analyze, drastic changes in the patient's situation get the viewers attention immediately.",
          keywords: 'Computer Graphics,Data Display,Intensive Care',
        },
        {
          DOI: '10.5220/0005714002120219',
          EHRCount: '439,547 patients, 833,710 EHRs',
          EHRs: 100000,
          ISBN: '978-989-758-175-5',
          UMLS: ['C0262926'],
          author: [
            'Shenhui Jiang',
            'Shiaofen Fang',
            'Sam Bloomquist',
            'Jeremy Keiper',
            'Mathew Palakal',
            'Yuni Xia',
            'Shaun Grannis',
          ],
          citation: 'Jiang2016',
          compTech: ['GEO', 'NLP'],
          name: 'Health-Terrain',
          number: 'Visigrapp',
          pub: 'Proceedings of the 11th joint conference on computer vision, imaging and computer graphics theory and applications',
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title:
            'Healthcare data visualization: Geospatial and temporal integration',
          year: 2016,
          abstract:
            'Healthcare data visualization is challenging due to the needs for integrating geospatial information, temporal information, text information, and heterogenious health attributes within a common visual context. We recently developed a web-based healthcare data visualization system, Health-Terrain, based on a Notifiable Condition Detector (NCD) use case. In this paper, we will describe this system, with emphasis on the visualization techniques developed specifically for healthcare data. Two new visualization techniques will be described: (1) A spatial texture based visualization approach for multi-dimensional attributes and time-series data; (2) A spiral theme plot technique for visualizing time-variant patient data.',
          keywords:
            'challenging due to the,data and text,geospatial information visualization,healthcare data,healthcare data visualization is,information,mining,needs for integrating geospatial,spatiotemporal visualization,web-based visualization systems',
        },
        {
          EHRs: 1001,
          UMLS: ['C3242284'],
          author: ['Chao Tong', 'Liam McNabb', 'Robert S. Laramee'],
          citation: 'Tong2018',
          compTech: ['GEO'],
          pub: 'Computer graphics & visual computing',
          scope: ['focus'],
          term: ['Public healthcare data'],
          title: 'Cartograms with topological features',
          name: 'Cartograms with Topological Features',
          year: 2018,
          abstract:
            "Cartograms are a popular and useful technique for depicting geo-spatial data. Dorling style and rectangular cartograms are very good for facilitating comparisons between unit areas. Each unit area is represented by the same shape such as a circle or rectangle, and the uniformity in shapes facilitates comparative judgment. However, the layout of these more abstract shapes may also simultaneously reduce the map's legibility and increase error. When we integrate univariate data into a cartogram, the recognizability of cartogram may be reduced. There is a trade-off between information recognition and geo-information accuracy. This is the inspiration behind the work we present. We attempt to increase the map's recognizability and reduce error by introducing topological features into the cartographic map. Our goal is to include topological features such as a river in a Dorling-style or rectangular cartogram to make the visual layout more recognizable, increase map cognition and reduce geo-spatial error. We believe that compared to the standard Dorling and rectangular style cartogram, adding topological features provides familiar geo-spatial cues and flexibility to enhance the recognizability of a cartogram.",
        },
        {
          DOI: '10.5210/ojphi.v8i3.7100',
          EHRCount: '12 million EHRs',
          EHRs: 100000,
          UMLS: ['C3242284'],
          author: ['Oluwakemi Ola', 'Kamran Sedig'],
          citation: 'Ola2016',
          compTech: ['GEO'],
          notVis: true,
          pub: 'Online Journal of Public Health Informatics',
          scope: ['focus'],
          term: ['EMR'],
          name: 'Beyond Geo',
          title:
            'Beyond simple charts: Design of visualizations for big health data',
          year: 2016,
          abstract:
            "Health data is often big data due to its high volume, low veracity, great variety, and high velocity. Big health data has the potential to improve productivity, eliminate waste, and support a broad range of tasks related to disease surveillance, patient care, research, and population health management. Interactive visualizations have the potential to amplify big data's utilization. Visualizations can be used to support a variety of tasks, such as tracking the geographic distribution of diseases, analyzing the prevalence of disease, triaging medical records, predicting outbreaks, and discovering at-risk populations. Currently, many health visualization tools use simple charts, such as bar charts and scatter plots, that only represent few facets of data. These tools, while beneficial for simple perceptual and cognitive tasks, are ineffective when dealing with more complex sensemaking tasks that involve exploration of various facets and elements of big data simultaneously. There is need for sophisticated and elaborate visualizations that encode many facets of data and support human-data interaction with big data and more complex tasks. When not approached systematically, design of such visualizations is labor-intensive, and the resulting designs may not facilitate big-data-driven tasks. Conceptual frameworks that guide the design of visualizations for big data can make the design process more manageable and result in more effective visualizations. In this paper, we demonstrate how a framework-based approach can help designers create novel, elaborate, non-trivial visualizations for big health data. We present four visualizations that are components of a larger tool for making sense of large-scale public health data.",
          keywords:
            '10,5210,7100,big health data,ca,correspondence,doi,health-related tasks,healthcare,human-data,interaction,multifaceted data,ojphi,oola,public health,sedig,sensemaking,uwo,v8i3,visualization design',
        },
        {
          EHRs: 1,
          UMLS: ['C0011847'],
          author: [
            'Alexander Rind',
            'Silvia Miksch',
            'Wolfgang Aigner',
            'Thomas Turic',
            'Margit Pohl',
          ],
          citation: 'Rind2010',
          name: 'VisuExplore',
          notVis: true,
          pub: 'Proceedings of the 1st International Workshop on Interactive Systems in Healthcare (WISH@CHI2010)',
          related: ['Rind2013', 'Rind2017a'],
          scope: ['context'],
          term: ['Medical data'],
          title:
            'VisuExplore: gaining new medical insights from visual exploration',
          year: 2010,
          abstract:
            'Alexander Rind ilvia Miksch S Overcoming information overload is a major challenge in current healthcare practice. Interactive Information Visualization methods are promising tools for physicians to ease this situation. We present our VisuExplore prototype, an interactive Information Visualization application for exploring patient data. Its user-centered design and development process involves physicians to match their requirements and needs. The VisuExplore prototype visualizes a flexible selection of medical parameters over time. It provides a range of interaction techniques, and is designed to be easy to use as well as unambiguous to interpret.',
          keywords:
            'information visualization,interaction techniques,medical information systems,time-oriented data',
        },
        {
          EHRs: 1001,
          UMLS: ['C3242284'],
          author: [
            'Chao Tong',
            'Liam McNabb',
            'Robert S. Laramee',
            'Jane Lyons',
            'Angharad M Walters',
            'Daniel Thayer',
            'Damon Berridge',
          ],
          citation: 'Tong2017a',
          compTech: ['GEO'],
          pub: 'Computer graphics & visual computing',
          scope: ['focus'],
          term: ['Public healthcare data'],
          title:
            'Time-oriented cartographic treemaps for visualization of public healthcare data chao',
          year: 2017,
        },
        {
          DOI: '10.1016/j.giq.2011.10.002',
          EHRs: 100000,
          UMLS: ['C3242284'],
          author: [
            'Awalin Sopan',
            'Angela Song-Ie Noh',
            'Sohit Karol',
            'Paul Rosenfeld',
            'Ginnah Lee',
            'Ben Shneiderman',
          ],
          citation: 'Sopan2012',
          compTech: ['GEO'],
          name: 'Community Health Map',
          notVis: true,
          pub: 'Government Information Quarterly',
          related: ['Carroll2014'],
          scope: ['focus'],
          term: ['Public health data'],
          title:
            'Community Health Map: A geospatial and multivariate data visualization tool for public health datasets',
          year: 2012,
          abstract:
            'Trillions of dollars are spent each year on health care. The U.S. Department of Health and Human Services keeps track of a variety of health care indicators across the country, resulting in a large geospatially multivariate data set. Current visualization tools for such data sets make it difficult to make multivariate comparisons and show the geographic distribution of the selected variables at the same time. Community Health Map is a web application that enables users to visualize health care data in multivariate space as well as geospatially. It is designed to aid exploration of this huge data repository and deliver deep insights for policy makers, journalists, consumer groups, and academic researchers. Users can visualize the geospatial distribution of a given variable on an interactive map, and compare two or more variables using charts and tables. By employing dynamic query filters, visualizations can be narrowed down to specific ranges and regions. Our presentation to policy makers and pilot usability evaluation suggest that the Community Health Map provides a comprehensible and powerful interface for policy makers to visualize health care quality, public health outcomes, and access to care in an effort to help them to make informed decisions about improving health care. textcopyright 2012 Elsevier Inc.',
          keywords:
            'Geospatial multivariate visualization,Graphical user interface,Healthcare data,Information visualization',
        },
        {
          DOI: '10.1109/TVCG.2015.2467733',
          EHRs: 2,
          UMLS: ['C0031437'],
          author: [
            'Michael Glueck',
            'Peter Hamilton',
            'Fanny Chevalier',
            'Simon Breslav',
            'Azam Khan',
            'Daniel Wigdor',
            'Michael Brudno',
          ],
          citation: 'Glueck2016',
          compTech: ['Comparison'],
          name: 'PhenoBlocks',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title: 'PhenoBlocks: Phenotype comparison visualizations',
          year: 2016,
          abstract:
            'textcopyright 1995-2012 IEEE. The differential diagnosis of hereditary disorders is a challenging task for clinicians due to the heterogeneity of phenotypes that can be observed in patients. Existing clinical tools are often text-based and do not emphasize consistency, completeness, or granularity of phenotype reporting. This can impede clinical diagnosis and limit their utility to genetics researchers. Herein, we present PhenoBlocks, a novel visual analytics tool that supports the comparison of phenotypes between patients, or between a patient and the hallmark features of a disorder. An informal evaluation of PhenoBlocks with expert clinicians suggested that the visualization effectively guides the process of differential diagnosis and could reinforce the importance of complete, granular phenotypic reporting.',
          keywords:
            'Bioinformatics,Data visualization,Diseases,Medical diagnostic imaging,Ontologies,Semantics',
        },
        {
          EHRs: 101,
          PMID: '22195102',
          UMLS: ['C0011847'],
          author: ['David Gotz', 'Jimeng Sun', 'Nan Cao', 'Shahram Ebadollahi'],
          citation: 'Gotz2011',
          compTech: ['Clustering'],
          name: 'DICON',
          pub: 'AMIA ... Annual Symposium proceedings / AMIA Symposium. AMIA Symposium',
          related: ['Rind2013', 'West2015'],
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title:
            'Visual cluster analysis in support of clinical decision intelligence.',
          year: 2011,
          abstract:
            'Electronic health records (EHRs) contain a wealth of information about patients. In addition to providing efficient and accurate records for individual patients, large databases of EHRs contain valuable information about overall patient populations. While statistical insights describing an overall population are beneficial, they are often not specific enough to use as the basis for individualized patient-centric decisions. To address this challenge, we describe an approach based on patient similarity which analyzes an EHR database to extract a cohort of patient records most similar to a specific target patient. Clusters of similar patients are then visualized to allow interactive visual refinement by human experts. Statistics are then extracted from the refined patient clusters and displayed to users. The statistical insights taken from these refined clusters provide personalized guidance for complex decisions. This paper focuses on the cluster refinement stage where an expert user must interactively (a) judge the quality and contents of automatically generated similar patient clusters, and (b) refine the clusters based on his/her expertise. We describe the DICON visualization tool which allows users to interactively view and refine multidimensional similar patient clusters. We also present results from a preliminary evaluation where two medical doctors provided feedback on our approach.',
        },
        {
          DOI: '10.1145/1978942.1979196',
          EHRCount: '7,041 patients',
          EHRs: 5001,
          ISBN: '978-1-4503-0228-9',
          UMLS: ['C0030704'],
          author: [
            'Krist Wongsuphasawat',
            'John Alexis Guerra Gómez',
            'Catherine Plaisant',
            'Taowei David Wang',
            'Meirav Taieb-Maimon',
            'Ben Shneiderman',
          ],
          citation: 'Wongsuphasawat2011',
          compTech: ['ESS'],
          name: 'LifeFlow',
          pub: "Proceedings of the 2011 annual conference on Human factors in computing systems - CHI '11",
          related: ['Rind2013', 'West2015', 'Rind2017a'],
          scope: ['focus'],
          term: ['EHR'],
          title: 'LifeFlow: Visualizing an overview of event sequences',
          year: 2011,
          abstract:
            'Event sequence analysis is an important task in many domains: medical researchers may study the patterns of transfers within the hospital for quality control; transportation experts may study accident response logs to identify best practices. In many cases they deal with thousands of records. While previous research has focused on searching and browsing, overview tasks are often overlooked. We introduce a novel interactive visual overview of event sequences called LifeFlow. LifeFlow is scalable, can summarize all possible sequences, and represents the temporal spacing of the events within sequences. Two case studies with healthcare and transportation domain experts are presented to illustrate the usefulness of LifeFlow. A user study with ten participants confirmed that after 15 minutes of training novice users were able to rapidly answer questions about the prevalence and temporal characteristics of sequences, find anomalies, and gain significant insight from the data. Copyright 2011 ACM.',
          keywords: 'Temporal categorical data,Timestamped event sequences',
        },
        {
          DOI: '10.1007/978-3-642-21716-6_13',
          EHRs: 1,
          ISBN: '978-3-642-21715-9',
          UMLS: ['C0599880'],
          author: ['Anthony Faiola', 'Chris Newlon'],
          citation: 'Faiola2011',
          name: 'MIVA',
          notVis: true,
          pub: 'International conference on ergonomics and health aspects of work with computers',
          related: ['Rind2013'],
          scope: ['context'],
          term: ['EMR', 'CDS'],
          title:
            'Advancing critical care in the ICU: A human-centered biomedical data visualization systems',
          year: 2011,
          abstract:
            'The purpose of this research is to provide medical clinicians with a new technology for interpreting large and diverse datasets to expedite critical care decision-making in the ICU. We refer to this technology as the medical information visualization assistant (MIVA). MIVA delivers multivariate biometric (bedside) data via a visualization display by transforming and organizing it into temporal resolutions that can provide contextual knowledge to clinicians. The result is a spatial organization of multiple datasets that allows rapid analysis and interpretation of trends. Findings from the usability study of the MIVA static prototype and heuristic inspection of the dynamic prototype suggest that using MIVA can yield faster and more accurate results. Furthermore, comments from the majority of the experimental group and the heuristic inspectors indicate that MIVA can facilitate clinical task flow in context-dependent health care settings. textcopyright 2011 Springer-Verlag Berlin Heidelberg.',
          keywords:
            'Biomedical data visualization,health care,health information technology,human-computer interaction,interface design',
        },
        {
          DOI: '10.1093/bioinformatics/btz409',
          EHRs: 1,
          UMLS: ['C5204342'],
          author: [
            'Benjamin S. Glicksberg',
            'Boris Oskotsky',
            'Phyllis M. Thangaraj',
            'Nicholas Giangreco',
            'Marcus A. Badgeley',
            'Kipp W. Johnson',
            'Debajyoti Datta',
            'Vivek A. Rudrapatna',
            'Nadav Rappoport',
            'Mark M. Shervey',
            'Riccardo Miotto',
            'Theodore C. Goldstein',
            'Eugenia Rutenberg',
            'Remi Frazier',
            'Nelson Lee',
            'Sharat Israni',
            'Rick Larsen',
            'Bethany Percha',
            'Li Li',
            'Joel T. Dudley',
            'Nicholas P. Tatonetti',
            'Atul J. Butte',
          ],
          citation: 'Glicksberg2019',
          compTech: ['Others'],
          editor: [{ family: 'Wren', given: 'Jonathan' }],
          name: 'PatientExploreR',
          notVis: true,
          pub: 'Bioinformatics',
          scope: ['focus'],
          term: ['EHR'],
          title:
            'PatientExploreR: an extensible application for dynamic visualization of patient clinical history from electronic health records in the OMOP common data model',
          year: 2019,
          abstract:
            'Motivation: Electronic health records (EHRs) are quickly becoming omnipresent in healthcare, but interoperability issues and technical demands limit their use for biomedical and clinical research. Interactive and flexible software that interfaces directly with EHR data structured around a common data model (CDM) could accelerate more EHR-based research by making the data more accessible to researchers who lack computational expertise and/or domain knowledge. Results: We present PatientExploreR, an extensible application built on the R/Shiny framework that interfaces with a relational database of EHR data in the Observational Medical Outcomes Partnership CDM format. PatientExploreR produces patient-level interactive and dynamic reports and facilitates visualization of clinical data without any programming required. It allows researchers to easily construct and export patient cohorts from the EHR for analysis with other software. This application could enable easier exploration of patient-level data for physicians and researchers. PatientExploreR can incorporate EHR data from any institution that employs the CDM for users with approved access. The software code is free and open source under the MIT license, enabling institutions to install and users to expand and modify the application for their own purposes. Availability and implementation: PatientExploreR can be freely obtained from GitHub: https://github.com/BenGlicksberg/PatientExploreR. We provide instructions for how researchers with approved access to their institutional EHR can use this package. We also release an open sandbox server of synthesized patient data for users without EHR access to explore: http://patientexplorer.ucsf.edu. Supplementary information: Supplementary data are available at Bioinformatics online.',
        },
        {
          DOI: '10.1093/jamia/ocx070',
          EHRs: 101,
          PMID: '29016825',
          UMLS: ['C0009378'],
          author: [
            'Gaurav Trivedi',
            'Phuong Pham',
            'Wendy W Chapman',
            'Rebecca Hwa',
            'Janyce Wiebe',
            'Harry Hochheiser',
          ],
          citation: 'Trivedi2018',
          compTech: ['NLP', 'ML'],
          name: 'NLPReViz',
          notVis: true,
          pub: 'Journal of the American Medical Informatics Association : JAMIA',
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title:
            'NLPReViz: an interactive tool for natural language processing on clinical text.',
          year: 2018,
          abstract:
            'The gap between domain experts and natural language processing expertise is a barrier to extracting understanding from clinical text. We describe a prototype tool for interactive review and revision of natural language processing models of binary concepts extracted from clinical notes. We evaluated our prototype in a user study involving 9 physicians, who used our tool to build and revise models for 2 colonoscopy quality variables. We report changes in performance relative to the quantity of feedback. Using initial training sets as small as 10 documents, expert review led to final F1scores for the "appendiceal-orifice" variable between 0.78 and 0.91 (with improvements ranging from 13.26% to 29.90%). F1for "biopsy" ranged between 0.88 and 0.94 (-1.52% to 11.74% improvements). The average System Usability Scale score was 70.56. Subjective feedback also suggests possible design improvements.',
          keywords:
            'electronic health records,machine learning,medical informatics,natural language processing (NLP),user-computer interface',
        },
        {
          DOI: '10.1109/TVCG.2012.225',
          EHRCount: '6,328 EHRs',
          EHRs: 5001,
          UMLS: ['C0018802'],
          author: ['Krist Wongsuphasawat', 'David Gotz'],
          citation: 'Wongsuphasawat2012a',
          compTech: ['ESS'],
          name: 'Outflow',
          pub: 'IEEE Transactions on Visualization and Computer Graphics',
          related: ['Rind2013', 'West2015', 'Gotz2016', 'Rind2017a'],
          scope: ['focus'],
          term: ['EMR'],
          title:
            'Exploring flow, factors, and outcomes of temporal event sequences with the outflow visualization',
          year: 2012,
          abstract:
            'Event sequence data is common in many domains, ranging from electronic medical records (EMRs) to sports events. Moreover, such sequences often result in measurable outcomes (e.g., life or death, win or loss). Collections of event sequences can be aggregated together to form event progression pathways. These pathways can then be connected with outcomes to model how alternative chains of events may lead to different results. This paper describes the Outflow visualization technique, designed to (1) aggregate multiple event sequences, (2) display the aggregate pathways through different event states with timing and cardinality, (3) summarize the pathways corresponding outcomes, and (4) allow users to explore external factors that correlate with specific pathway state transitions. Results from a user study with twelve participants show that users were able to learn how to use Outflow easily with limited training and perform a range of tasks both accurately and rapidly. textcopyright 1995-2012 IEEE.',
          keywords:
            'Outflow,information visualization,state diagram,state transition,temporal event sequences',
        },
        {
          DOI: '10.1109/TITB.2006.884365',
          EHRs: 1,
          UMLS: ['C0679831'],
          author: ['Alex A. T. Bui', 'Denise R. Aberle', 'Hooshang Kangarloo'],
          citation: 'Bui2007',
          compTech: ['NLP'],
          name: 'TimeLine',
          pub: 'IEEE Transactions on Information Technology in Biomedicine',
          related: ['Roque2010'],
          scope: ['context'],
          term: ['EMR', 'CDS'],
          title: 'TimeLine: Visualizing integrated patient records',
          year: 2007,
          abstract:
            'An increasing amount of data is now accrued in medical information systems; however, the organization of this data is still primarily driven by data source, and does not support the cognitive processes of physicians. As such, new methods to visualize patient medical records are becoming imperative in order to assist physicians with clinical tasks and medical decision-making. The TimeLine system is a problem-centric temporal visualization for medical data: information contained with medical records is reorganized around medical disease entities and conditions. Automatic construction of the TimeLine display from existing clinical repositories occurs in three steps: 1) data access, which uses an eXtensible Markup Language (XML) data representation to handle distributed, heterogeneous medical databases; 2) data mapping and reorganization, reformulating data into hierarchical, problem-centric views; and 3) data visualization, which renders the display to a target presentation platform. Leveraging past work, we describe the latter two components of the TimeLine system in this paper, and the issues surrounding the creation of medical problems lists and temporal visualization of medical data. A driving factor in the development of TimeLine was creating a foundation upon which new data types and the visualization metaphors could be readily incorporated. textcopyright 2007 IEEE.',
          keywords: 'Medical information systems,Patient records,Visualization',
        },
        {
          DOI: '10.1145/3344258',
          EHRCount: '7,537 patients with 64,269 EHRs',
          EHRs: 5001,
          UMLS: ['C0007222', 'C0035242', 'C0599880'],
          author: [
            'Zhuochen Jin',
            'Shuyuan Cui',
            'Shunan Guo',
            'David Gotz',
            'Jimeng Sun',
            'Nan Cao',
          ],
          citation: 'Jin2020',
          compTech: ['ML', 'ESS'],
          name: 'CarePre',
          notVis: true,
          pub: 'ACM Transactions on Computing for Healthcare',
          scope: ['focus'],
          term: ['EHR', 'CDS'],
          title: 'CarePre: An intelligent clinical decision assistance system',
          year: 2020,
          abstract:
            'Clinical decision support systems (CDSS) are widely used to assist with medical decision making. However, CDSS typically require manually curated rules and other data which are difficult to maintain and keep up-to-date. Recent systems leverage advanced deep learning techniques and electronic health records (EHR) to provide more timely and precise results. Many of these techniques have been developed with a common focus on predicting upcoming medical events. However, while the prediction results from these approaches are promising, their value is limited by their lack of interpretability. To address this challenge, we introduce CarePre, an intelligent clinical decision assistance system. The system extends a state-of-the-art deep learning model to predict upcoming diagnosis events for a focal patient based on his/her historical medical records. The system includes an interactive framework together with intuitive visualizations designed to support the diagnosis, treatment outcome analysis, and the interpretation of the analysis results. We demonstrate the effectiveness and usefulness of CarePre system by reporting results from a quantities evaluation of the prediction algorithm and a case study and three interviews with senior physicians.',
        },
      ],
      fields: [
        {
          key: 'title',
          label: 'Title',
          sortable: true,
          thStyle: 'width:35%',
        },
        { key: 'citation', label: 'Image', thStyle: 'width:15%' },
        {
          key: 'author',
          label: 'Authors',
          sortable: true,
          thStyle: 'width:25%',
        },
        { key: 'pub', label: 'Publication', thStyle: 'width:10%' },
        {
          key: 'compTech',
          label: 'Techniques',
          thStyle: 'width:10%',
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
      authorList: [
        'Aaron Snyder',
        'Albert Amor-Amorós',
        'Alex A. T. Bui',
        'Alexander Rind',
        'Alina Gvozdik',
        'Amy Karlson',
        'Andreas Bannach',
        'Andreas Seyfang',
        'Andrew James',
        'Angela Song-Ie Noh',
        'Angharad M Walters',
        'Anirudh Thommandram',
        'Anthony Faiola',
        'Arunesh Mittal',
        'Asa Viccellio',
        'Atul J. Butte',
        'Awalin Sopan',
        'Azam Khan',
        'Ben Shneiderman',
        'Benjamin J.J. McCormick',
        'Benjamin S. Glicksberg',
        'Bethany Percha',
        'Boris Oskotsky',
        'Brigitte I. Frohnert',
        'Bum Chul Kwon',
        'Carolyn McGregor',
        'Catherine Plaisant',
        'Chao Tong',
        'Charles Perin',
        'Chris Newlon',
        'Christian Popow',
        'Christopher Collins',
        'Cody Dunne',
        'Damon Berridge',
        'Dan Heller',
        'Daniel Thayer',
        'Daniel Wigdor',
        'David Boaz',
        'David Borland',
        'David Gotz',
        'David Roseman',
        'David Sessler',
        'Debajyoti Datta',
        'Denis Klimov',
        'Denise R. Aberle',
        'Devin Singh',
        'Dina Goren-Bar',
        'Dirk Pehrke',
        'Eberechukwu Onukwugha',
        'Edward Choi',
        'Eileen Villa',
        'Elizabeth Jimenez',
        'Eugenia Rutenberg',
        'Faisal Ahmed',
        'Fan Du',
        'Fanny Chevalier',
        'Filip Dabek',
        'Finale Doshi-Velez',
        'Gaurav Trivedi',
        'Gil Tahan',
        'Ginnah Lee',
        'Greg Marchand',
        'Hanseung Lee',
        'Harry Hochheiser',
        'Harry Stavropoulos',
        'Hongyuan Zha',
        'Hooshang Kangarloo',
        'Iv Ramakrishnan',
        'Jaegul Choo',
        'James Edward Pugh',
        'Jane Lyons',
        'Janyce Wiebe',
        'Jeremy Keiper',
        'Jerry Fails',
        'Jesus J. Caban',
        'Jia Li',
        'Jimeng Sun',
        'Joanne Taery Kim',
        'Joel T. Dudley',
        'John Alexis Guerra Gómez',
        'Jorn Kohlhammer',
        'Jurgen Bernard',
        'Jörn Kohlhammer',
        'Jürgen Bernard',
        'Jürgen Unger',
        'Kamran Sedig',
        'Kartik Chanana',
        'Katharina Kaiser',
        'Ke Xu',
        'Kenney Ng',
        'Kipp W. Johnson',
        'Klaus Hinum',
        'Klaus Mueller',
        'Krist Wongsuphasawat',
        'Kristen A. Severson',
        'Lukas Unterasinger',
        'Layla Shahamat',
        'Li Li',
        'Liam McNabb',
        'Lilia L. Ramírez-Ramírez',
        'Lucia Sacchi',
        'Mahdi Pakdaman Naeini',
        'Marcus A. Badgeley',
        'Margit Pohl',
        'Mark M. Shervey',
        'Mark Smith',
        'Markus Lundgren',
        'Markus Rester',
        'Mary Thompson',
        'Mathew Palakal',
        'Matt McPherson',
        'Maya Galperin-Aizenberg',
        'Megan Monroe',
        'Meirav Taieb-Maimon',
        'Michael Brudno',
        'Michael Glueck',
        'Michael Hill',
        'Min Je Choi',
        'Mona Hosseinkhani Loorak',
        'Nadav Rappoport',
        'Nan Cao',
        'Neil Spring',
        'Nelson Lee',
        'Nicholas Giangreco',
        'Nicholas P. Tatonetti',
        'Nicole Sultanum',
        'Noreen Kamal',
        'Oluwakemi Ola',
        'Paolo Federico',
        'Paul Rosenfeld',
        'Peter Hamilton',
        'Phuong Pham',
        'Phyllis M. Thangaraj',
        'Ragnar Bade',
        'Rebecca Hwa',
        'Remi Frazier',
        'Riccardo Miotto',
        'Richard Mushlin',
        'Richard Roberts',
        'Rick Larsen',
        'Rishikesan Kamaleswaran',
        'Robert S. Laramee',
        'Rong Zhao',
        'Rongjian Lan',
        'Rongwen Zhao',
        'Roy A. Ruddle',
        'Sam Bloomquist',
        'Sana Malik',
        'Shahram Ebadollahi',
        'Sharat Israni',
        'Shaun Grannis',
        'Sheelagh Carpendale',
        'Shenhui Jiang',
        'Shiaofen Fang',
        'Shunan Guo',
        'Shuyuan Cui',
        'Silvia Miksch',
        'Simon Breslav',
        'Sohit Karol',
        'Soonwook Kwon',
        'Soumya Ghosh',
        'Stefan Schlechtweg',
        'Susanne Ohmann',
        'Taowei David Wang',
        'Theodore C. Goldstein',
        'Theresia Gschwandtner',
        'Thomas Turic',
        'Thorsten May',
        'Thorsten Schlomm',
        'Vibha Anand',
        'Vikramjit Mukherjee',
        'Vivek A. Rudrapatna',
        'Vivian L West',
        'W Ed Hammond',
        'Werner Horn',
        'Wendy W Chapman',
        'Wladimir J. Alonso',
        'Wolfgang Aigner',
        'Yixuan Zhang',
        'Young Bin Kim',
        'Yulia R. Gel',
        'Yuni Xia',
        'Yuval Shahar',
        'Zhaonan Sun',
        'Zhiyuan Zhang',
        'Zhuochen Jin',
      ],
      authorSearch: '',
      authorSelected: [],
      techniqueList: ['ESS', 'ML', 'Clustering', 'Comparison'],
      techniqueSearch: '',
      techniqueSelected: [],
      infoModal: {
        id: 'info-modal',
        data: {
          author: [],
        },
      },
    }
  },
  computed: {
    filteredItems() {
      const filterByAuthor = (paper) => {
        for (let i = 0; i < paper.author.length; i++) {
          const author = paper.author[i]
          if (this.authorSelected.includes(author)) {
            return true
          }
        }
        return false
      }

      const filterByTechnique = (paper) => {
        if (paper.compTech) {
          for (let i = 0; i < paper.compTech.length; i++) {
            const technique = paper.compTech[i]
            if (this.techniqueSelected.includes(technique)) {
              return true
            }
          }
        }
        return false
      }

      const res = this.items.filter((paper) => {
        if (
          this.authorSelected.length === 0 &&
          this.techniqueSelected.length === 0
        ) {
          return true
        }

        // if author tags are selected
        if (this.authorSelected.length > 0) {
          const filterByAuthorResult = filterByAuthor(paper)
          // if technique tags are selected as well
          if (this.techniqueSelected.length > 0) {
            if (filterByAuthorResult && filterByTechnique(paper)) {
              return true
            }
          } else if (filterByAuthorResult) {
            return true
          }
        }

        // if only technique tags are selected
        else if (this.techniqueSelected.length > 0) {
          if (filterByTechnique(paper)) {
            return true
          }
        }

        return false
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
    availableTags(type) {
      const criteria = this[type + 'Search'].trim().toLowerCase()
      const options = this[type + 'List'].filter(
        (o) => !this[type + 'Selected'].includes(o)
      )
      if (criteria) {
        return options.filter((opt) => opt.toLowerCase().includes(criteria))
      }
      return options
    },
    filterTable(row, filter) {
      let filters = ['title', 'author', 'pub']
      if (this.filterOn.length > 0) {
        filters = this.filterOn
      }

      for (let i = 0; i < filters.length; i++) {
        const f = filters[i]
        if (row[f].toString().toLowerCase().includes(filter.toLowerCase())) {
          return true
        }
      }

      return false
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    addToTagValue({ option, addTag }) {
      addTag(option)
      this.authorSearch = ''
    },
    clickAddTag(author) {
      if (this.authorSelected.includes(author)) {
        this.authorSelected = this.authorSelected.filter((a) => a !== author)
      } else {
        this.authorSelected.push(author)
      }
    },
    openModal(item, index, button) {
      this.infoModal.data = item
      this.$root.$emit('bv::show::modal', this.infoModal.id, button)
    },
    resetInfoModal() {
      this.infoModal.data = {
        author: [],
      }
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
