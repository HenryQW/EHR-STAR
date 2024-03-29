const fs = require('fs')
const path = require('path')
const proc = require('child_process').spawn('pbcopy')
const BibtexParser = require('bib2json')

const input = [
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
  },
  {
    DOI: '10.1109/VAST.2006.261421',
    EHRCount: '950 patients, over 26,000 EHRs',
    EHRs: 5001,
    ISBN: '1-4244-0591-2',
    UMLS: ['C0262926'],
    author: ['Jerry Fails', 'Amy Karlson', 'Layla Shahamat', 'Ben Shneiderman'],
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
    title: 'VisuExplore: gaining new medical insights from visual exploration',
    year: 2010,
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
    title: 'A visual-interactive system for prostate cancer cohort analysis',
    year: 2015,
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
    title: 'Healthcare data visualization: Geospatial and temporal integration',
    year: 2016,
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
    title: 'Beyond simple charts: Design of visualizations for big health data',
    year: 2016,
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
    title: 'Cartographic treemaps for visualization of public healthcare data',
    year: 2017,
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
  },
  {
    DOI: '10.1007/s00371-021-02171-w',
    EHRCount: '200 real patient letters',
    EHRs: 101,
    UMLS: ['C0014544'],
    author: [
      'Qiru Wang',
      'Robert S. Laramee',
      'Arron Lacey',
      'William Owen Pickrell',
    ],
    citation: 'Wang2021',
    compTech: ['Comparison', 'NLP'],
    name: 'LetterVis',
    pub: 'The Visual Computer',
    scope: ['focus'],
    term: ['EHR'],
    title: 'LetterVis: A Letter-Space View of Electronic Health Records',
    year: 2021,
  },
  {
    DOI: '10.1111/cgf.13662',
    EHRS: 1001,
    UMLS: ['C0023981'],
    author: [
      'Shiva Alemzadeh',
      'Uli Niemann',
      'Till Ittermann',
      'Henry Völzke',
      'Daniel Schneider',
      'Myra Spiliopoulou',
      'Katja Bühler',
      'Bernhard Preim',
    ],
    challenge: [1, 5],
    citation: 'Alemzadeh2019',
    compTech: ['GEO'],
    evaluation: [0, 0, 0, 0],
    pub: 'Computer Graphics Forum',
    scope: ['focus'],
    techniques: [
      'Chord',
      'Standard 2D Displays',
      'Parallel Coordinates',
      'Matrix',
    ],
    term: ['Longitudinal cohort study'],
    title:
      'Visual Analysis of Missing Values in Longitudinal Cohort Study Data',
    year: 2019,
  },
  {
    DOI: '10.1109/TVCG.2015.2468291',
    EHRs: 101,
    UMLS: ['C3242284', 'C1659543', 'C2711227'],
    author: [
      'Paul Klemm',
      'Kai Lawonn',
      'Sylvia Glaßer',
      'Uli Niemann',
      'Katrin Hegenscheid',
      'Henry Völzke',
      'Bernhard Preim',
    ],
    challenge: [1, 2],
    citation: 'Klemm2015a',
    compTech: ['GEO'],
    evaluation: [3, 3, 2, 0],
    pub: 'IEEE Transactions on Visualization and Computer Graphics',
    scope: ['focus'],
    techniques: ['Heatmap+'],
    term: ['Population health'],
    title: '3D Regression Heat Map Analysis of Population Study Data',
    year: 2015,
  },
]

let data
try {
  data = fs.readFileSync(path.resolve(__dirname, 'data.bib'), 'utf8')
} catch (e) {
  console.log('Error:', e.stack)
}

const output = []

BibtexParser(data).entries.forEach((e) => {
  const match = input.find((n) => n.citation === e.EntryKey)

  if (match) {
    match.abstract = e.Fields.abstract
    match.keywords = e.Fields.keywords
    output.push(match)
  }
})

const authorList = []

output.forEach((e) => {
  e.author.forEach((a) => {
    if (!authorList.includes(a)) {
      authorList.push(a)
    }
  })
})

authorList.sort()

// proc.stdin.write(JSON.stringify(output))
proc.stdin.write(JSON.stringify(authorList))
proc.stdin.end()
