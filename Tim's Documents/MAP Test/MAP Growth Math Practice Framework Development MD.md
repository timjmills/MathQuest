# **Architectural Blueprint for MAP Growth Mathematics Practice Platforms: Aligning K-5 Domains, RIT Bands, and Interactive Modalities**

The development of a high-fidelity educational platform designed to mirror the rigor, adaptability, and cognitive demands of the Northwest Evaluation Association (NWEA) Measures of Academic Progress (MAP) Growth mathematics assessment requires an exhaustive understanding of psychometric scaling, domain structures, and digital interaction design. The MAP Growth assessment utilizes a computer-adaptive framework underpinned by Item Response Theory (IRT) to dynamically measure student proficiency.1 By mapping educational content to the Rasch Unit (RIT) scale, educators and platform developers can precisely target a student's zone of proximal development.2

This comprehensive analysis deconstructs the specific mathematics skills, instructional domains, and digital answering modalities required to construct a robust practice environment for K-2 and 3-5 students across the 161 to 230 RIT bands. Furthermore, it synthesizes alignments from established platforms such as IXL and Khan Academy to provide a granular content roadmap for curriculum developers. The resulting architectural blueprint provides the necessary pedagogical and technical specifications to ensure that any derivative practice platform accurately reflects the cognitive load, interface mechanics, and algorithmic difficulty of the authentic MAP Growth environment.

## **Psychometric Foundations and Adaptive Architecture**

To replicate the efficacy of the MAP Growth assessment, a practice platform must first operationalize the mathematical models governing item difficulty and student ability. The assessment relies on the Rasch Unit (RIT) scale, which operates as an equal-interval vertical scale spanning from approximately 100 to 350\.4 The equal-interval nature of this scale dictates that the distance between scores remains mathematically consistent regardless of the student's age, grade, or developmental stage.5 For example, an increase from a RIT score of 160 to 170 represents the precise same magnitude of academic growth as an increase from 210 to 220\.5 This allows for longitudinal tracking of student achievement across their entire K-12 educational trajectory.

The assessment's adaptive engine utilizes maximum likelihood estimation to dynamically pair students with test items.1 As a student navigates the exam, the algorithm selects items that the student has an approximate 50% probability of answering correctly.4 Correct responses prompt the engine to deliver items of higher difficulty, thereby increasing the estimated RIT score, while incorrect responses result in the presentation of less difficult items.6

Recently, the underlying mechanics of this adaptive testing model were refined through the implementation of the Enhanced Item Selection Algorithm (EISA).1 The EISA prioritizes on-grade content while maintaining the flexibility to adapt to off-grade items when a student's performance necessitates such a shift.1 This update was designed to more closely align the assessment with grade-level content and enhance overall content validity, ensuring that students are primarily tested on subject matter they have had the opportunity to learn in their current classroom environments.7 For software developers constructing a practice environment, this psychometric architecture necessitates the creation of a vast, rigorously tagged item bank. Every individual practice question must be strictly correlated not only to a specific Common Core State Standard (CCSS) but also to an empirically derived RIT difficulty index.

## **Structural Differences Between K-2 and 2-5 Assessments**

Platform architecture must account for the distinct developmental and cognitive differences between the MAP Growth K-2 and 2-5 assessments. While both assessments map to the same continuous RIT scale, their delivery mechanisms, interface designs, and item interactions are fundamentally divergent to accommodate the neurological and educational development of the target demographics.

The K-2 assessment is explicitly tailored for pre-readers and emergent readers.8 Because mathematics proficiency must be measured independently of reading comprehension, the K-2 testing environment relies heavily on audio support, graphical interfaces, and highly visual problem representations, with minimal on-screen text.8 Questions are read aloud to the student automatically, ensuring that a lack of phonemic awareness does not artificially depress a student's demonstrated mathematical ability.10 The test is generally shorter, comprising approximately 43 items, and typically takes young learners 15 to 30 minutes to complete.10

Conversely, the 2-5 assessment assumes independent reading capability and introduces complex, text-heavy word problems.8 The default audio support is removed, although text-to-speech functionality remains available as a specific designated accommodation for students with Individualized Education Programs (IEPs), 504 plans, or English Language Learner (ELL) requirements.8 The 2-5 assessment is longer, containing between 47 and 53 questions, and demands greater sustained attention, typically taking 45 to 60 minutes.10 A dynamic practice platform must seamlessly toggle these interface paradigms—activating mandatory audio and visual scaffolds for lower RIT bands and transitioning to text-dense, multi-step problem solving for higher bands—based on the user's enrolled grade level and demonstrated RIT proficiency.

## **Curricular Domains and Instructional Strands**

The MAP Growth mathematics blueprint evaluates students across several core domains, which are derived from the Common Core State Standards. These domains shift slightly in nomenclature and complexity as students progress from the primary grades into upper elementary and middle school mathematics.12 Constructing a holistic practice platform requires populating content across all of the following instructional strands.

| Domain Category | K-2 Focus Areas | 3-5 Focus Areas | 6+ Focus Areas |
| :---- | :---- | :---- | :---- |
| **Operations and Algebraic Thinking** | Representing and solving basic addition and subtraction problems; identifying simple patterns. | Multi-step word problems; properties of operations (commutative, associative); numerical expressions. | Expressions and equations; evaluating variables; functions and modeling relationships. |
| **Number and Operations** | Counting and cardinality; basic base-ten concepts; rote counting forward and backward. | Fractions (equivalence, addition, subtraction); decimals to the thousandths; multi-digit arithmetic. | Real and complex number systems; ratios and proportional relationships; rational numbers. |
| **Measurement and Data** | Geometric measurement (length, height); telling time to the hour; basic pictographs and bar graphs. | Area and perimeter; elapsed time; volume of prisms; interpreting line plots and scatter plots. | Statistics and probability; distributions; theoretical versus experimental probability. |
| **Geometry** | Recognizing and drawing 2-D and 3-D shapes; understanding halves and fourths. | Classifying shapes by properties (parallel lines, angles); symmetry; coordinate plane. | Congruence; similarity; right triangles; trigonometry; geometric transformations. |

Table 1: Evolution of NWEA MAP Growth Mathematics Domains across developmental grade bands.10

## **Exhaustive RIT Band Skill Progressions (161–230)**

The following analytical sections dissect the specific mathematical competencies required within each 10-point RIT band spanning 161 to 230\. This progression represents the journey from late kindergarten/early first-grade mathematics through to advanced middle school pre-algebra. By integrating pedagogical objectives with proven skill mappings from Khan Academy and IXL, these breakdowns provide the explicit specifications required to draft thousands of highly targeted practice items.

### **RIT Band 161–170: Emergent Operational Thinking**

At this foundational stage, learners are transitioning from basic cardinality to the formal operational thinking required for addition and subtraction. The cognitive load focuses on early numeracy, concrete physical representations of mathematical concepts, and basic geometric recognition.

**Cognitive Profile and Lexical Introduction:** Students in the 161-170 RIT band are expected to understand the horizontal and vertical formats of equations, necessitating a dual processing of spatial and numerical information.14 The vocabulary introduced at this stage is highly concrete. Students must internalize terms such as "digit," "ones," "tens," "hundreds," "halves," "thirds," and "fourths".15 Furthermore, they are introduced to standard units of measurement including "foot," "inch," "yard," and "mile," alongside data representation terminology like "bar graph" and "pictograph".15

**Curricular Mapping and Standards Alignment:** Educational platforms have meticulously mapped their content to these specific skill thresholds. IXL, for instance, focuses its content on adding by counting on (sums up to 10), completing addition sentences to make ten, and understanding fact families up to 10\.16 Geometry skills at this level involve composing basic two-dimensional shapes.16 Khan Academy correlates this band to CCSS K.OA.A.5, which dictates adding and subtracting within 5, and transitions into 1.OA.B.4, which involves understanding subtraction as an unknown-addend problem.17

| Platform | Targeted Skill / Standard | Specific Problem Types |
| :---- | :---- | :---- |
| **IXL** | Addition and Subtraction Facts | Add by counting on (sums up to 10); Subtraction sentences: true or false? |
| **IXL** | Related Facts | Relate addition and subtraction sentences; Fact families (up to 10). |
| **Khan Academy** | K.OA.A.5 | Add and subtract fluently within 5\. |
| **Khan Academy** | 1.OA.B.4 | Understand subtraction as an unknown-addend problem. |

Table 2: Alignment of external platform skills to the 161-170 RIT Band.16

**Interaction Design and Answering Modalities:** Questions in this band must be highly visual and rely on drag-and-drop mechanics. For example, a typical MAP Growth item requires students to "Move the trees to the yard to show how many there are altogether" to solve a story problem.9 Another common interaction requires moving a digit from a number bank to complete a sentence such as "4 \+ \_\_ \= 6".9 Multiple-choice selections should feature large, easily clickable buttons rather than small radio dials, allowing students to select a specific number of visual objects (e.g., clicking on the correct grouping of superheroes).9 Text must be minimized, and auditory prompts are essential.

### **RIT Band 171–180: Abstraction and Place Value Expansion**

Students scoring in the 171-180 band are solidifying first-grade concepts and engaging with second-grade standards. The abstraction of mathematics increases significantly, requiring students to look beyond simple counting and understand the properties that govern mathematical operations.

**Cognitive Profile and Lexical Introduction:** The conceptual leap in this band involves understanding unknowns in number sentences and utilizing estimation and rounding.15 Vocabulary expands to include structural mathematical terms such as "expanded form," "parentheses," "numerator," "denominator," "equivalent," and "line of symmetry".15 Students explore the concepts of even and odd numbers, and place value mastery is expected to expand to the thousands and ten thousands.15 Time concepts become more granular, moving from the hour to reading clocks to the minute, half-past, and quarter-hour.15

**Curricular Mapping and Standards Alignment:** IXL skill mappings for this band focus heavily on expanding the numerical range of operations. Skills include adding three numbers, mastering subtraction facts up to 20, and writing numbers up to 100 in words.16 Geometric tasks increase in complexity, asking students to select three-dimensional shapes such as cubes and rectangular prisms, and to count vertices, edges, and faces.16 Khan Academy aligns this band with CCSS 1.OA.C.6 (adding and subtracting within 20\) and introduces 2.OA.C.4, which uses addition to find the total number of objects arranged in rectangular arrays, forming the critical bridge into multiplication.17

| Platform | Targeted Skill / Standard | Specific Problem Types |
| :---- | :---- | :---- |
| **IXL** | Addition up to 20 | Add three numbers \- make ten; Addition word problems (sums to 20). |
| **IXL** | Number Names & Counting | Skip-count by fives and tens; Spell word names for numbers up to 20\. |
| **IXL** | 3-D Geometry | Count vertices, edges, and faces; Select three-dimensional shapes. |
| **Khan Academy** | 1.OA.C.6 | Add and subtract within 20, demonstrating fluency. |
| **Khan Academy** | 2.OA.C.4 | Use addition to find the total number of objects in rectangular arrays. |

Table 3: Alignment of external platform skills to the 171-180 RIT Band.16

**Interaction Design and Answering Modalities:** While drag-and-drop remains a crucial interaction, standard keypad entry begins to emerge as a primary input method. Students may listen to a word problem and be required to use an on-screen or physical keyboard to type the resulting digits into a blank box.9 Visual selection tasks become more complex, such as clicking on an image to identify which object belongs in a specific categorical group or selecting a picture that represents a circle from a dense array of geometric distractors.9

### **RIT Band 181–190: The Multiplication Threshold**

This band represents a critical transition into core upper-elementary concepts, serving as the threshold where students formalize their understanding of multiplication, division, and fractions.

**Cognitive Profile and Lexical Introduction:** The mathematical vocabulary introduced in this band reflects a shift toward geometric precision and data analysis. Students must comprehend terms like "acute angle," "obtuse angle," "right angle," "parallel," and "protractor".15 In the domain of data, they are introduced to "bivariate data," "scatter plots," and "tables".15 The concept of fractions expands to include the addition and subtraction of mixed numbers, while overall number sense stretches to encompass millions and ten millions.15

**Curricular Mapping and Standards Alignment:** IXL addresses this RIT band by focusing on arrays, repeated addition, and the introduction of multiplication expressions.16 Students practice adding doubles and subtracting by counting back.16 Khan Academy provides direct alignment to the third-grade multiplication standards, specifically 3.OA.A.1 (interpreting products of whole numbers), 3.OA.A.3 (solving multiplication and division word problems within 100), and 3.OA.A.4 (determining the unknown whole number in a multiplication or division equation).17

| Platform | Targeted Skill / Standard | Specific Problem Types |
| :---- | :---- | :---- |
| **IXL** | Intro to Multiplication | Identify multiplication expressions for equal groups; Make arrays. |
| **IXL** | Addition and Subtraction | Identify repeated addition for arrays; Add doubles using models. |
| **Khan Academy** | 3.OA.A.1 | Interpret products of whole numbers. |
| **Khan Academy** | 3.OA.A.3 | Use multiplication and division within 100 to solve word problems. |
| **Khan Academy** | 3.OA.A.4 | Determine the unknown whole number in a multiplication equation. |

Table 4: Alignment of external platform skills to the 181-190 RIT Band.16

**Interaction Design and Answering Modalities:** In this band, developers must implement complex visual manipulatives. For example, a student might be asked to solve a subtraction problem with regrouping (e.g., 99 \- 56\) by dragging virtual base ten blocks across the screen to decompose tens into ones.9 Standard multiple-choice questions (A, B, C, D) are frequently used to translate word sentences into numerical expressions.9 Hotspot selection continues to be used for data interpretation, such as clicking on a specific student's name within a digital sticker chart to answer a query about maximum quantities.9

### **RIT Band 191–200: Multi-Step Processing and Rational Numbers**

Students operating in the 191-200 band demonstrate solid third-grade and emergent fourth-grade proficiency. The primary cognitive leap here involves holding multiple pieces of mathematical information in working memory to solve multi-step problems.

**Cognitive Profile and Lexical Introduction:** Vocabulary in this band becomes highly specialized. In the realm of fractions, students encounter "simplest form" and "composite" numbers.15 Decimals are formally introduced, alongside the concept of negative numbers on a number line.15 Measurement vocabulary expands to require conversions between "cups," "pints," "quarts," "gallons," "ounces," and "pounds".15 Geometrically, students must differentiate between specific polygon classifications, such as "equilateral" and "isosceles" triangles, and understand structural concepts like "perimeter" and "rays".15

**Curricular Mapping and Standards Alignment:** IXL skill mappings demand that students tackle multi-step word problems involving the multiplication of 1-digit numbers by 2, 3, or 4-digit numbers.16 Students must also navigate problems involving remainders and identify extra or missing information within word problems—a critical test of reading comprehension applied to mathematical logic.16 Khan Academy aligns this cognitive load to CCSS 4.OA.A.3 (solving multi-step word problems posed with whole numbers and having whole-number answers using the four operations) and 3.OA.B.5 (applying properties of operations as strategies to multiply and divide).18

| Platform | Targeted Skill / Standard | Specific Problem Types |
| :---- | :---- | :---- |
| **IXL** | Multi-Step Word Problems | Multiply 1-digit by 3-digit numbers in word problems; Understand remainders. |
| **IXL** | Logic and Comprehension | Word problems with extra or missing information. |
| **Khan Academy** | 4.OA.A.3 | Solve multi-step word problems using the four operations. |
| **Khan Academy** | 3.OA.B.5 | Apply associative and commutative properties of multiplication. |

Table 5: Alignment of external platform skills to the 191-200 RIT Band.16

**Interaction Design and Answering Modalities:** To accurately mirror MAP Growth, platforms must deploy "Multi-Select" or "Evidence-Based Selected-Response" formats. Rather than a single radio button, students are presented with square checkboxes and asked to "Choose ALL the sets that show an odd number of basketballs" or "Choose ALL the expressions equivalent to 1/3".9 This prevents students from arriving at the correct answer through simple process-of-elimination. Drag-and-drop mechanics are frequently utilized for interactive number lines, requiring the precise placement of fractions.9

### **RIT Band 201–210: High-Precision Decimals and Advanced Geometry**

At the 201-210 level, students are mastering fourth-grade standards and entering fifth-grade territory. The mathematics becomes highly abstract, shifting focus from whole numbers to operations with rational numbers, advanced geometry, and statistical analysis.

**Cognitive Profile and Lexical Introduction:** Students are expected to perform high-precision decimal work, necessitating an understanding of the "tenths," "hundredths," and "thousandths" places.15 They must evaluate expressions with variables and utilize statistical measures including "mean," "median," "mode," and "outliers".15 Geometric concepts move into three dimensions, requiring students to calculate the volume of "prisms" and "pyramids" using "unit cubes" and apply "scale factors".15

**Curricular Mapping and Standards Alignment:** IXL addresses this band with complex geometric classification tasks. Students are asked to classify quadrilaterals based on parallel sides, identify parallelograms, and distinguish between acute, right, and obtuse triangles.16 Number sense tasks involve identifying place value names up to one million and converting between word names and numerical digits for massive quantities.16 Khan Academy maps this band to CCSS 4.G.A.1 (drawing and identifying lines and angles) and 4.MD.C.6 (measuring angles in whole-number degrees using a protractor).2

| Platform | Targeted Skill / Standard | Specific Problem Types |
| :---- | :---- | :---- |
| **IXL** | Advanced Geometry | Classify quadrilaterals; Acute, obtuse, and right triangles. |
| **IXL** | Large Number Place Value | Writing numbers up to one million; Convert words to digits. |
| **Khan Academy** | 4.G.A.1 | Draw points, lines, line segments, rays, angles, and perpendicular lines. |
| **Khan Academy** | 4.MD.C.6 | Measure angles in whole-number degrees using a protractor. |

Table 6: Alignment of external platform skills to the 201-210 RIT Band.2

**Interaction Design and Answering Modalities:** The interface must support intricate drag-and-drop assignments. A hallmark MAP Growth question at this level requires students to "Move digits to the correct place value in the boxes" to complete a table for a six-digit number, testing deep conceptual understanding of the base-ten system.9 Standard multiple choice is utilized for identifying all factors of a number or solving algebraic equations such as ![][image1].9 Interactive graphing becomes prominent, requiring students to interpret the representation of sums on a number line.9

### **RIT Band 211–220: Pre-Algebra and Statistical Distributions**

This band represents the culmination of elementary mathematics and the formal introduction of middle school (grade 6\) pre-algebraic concepts. The cognitive demand shifts heavily toward symbolic representation and relational thinking.

**Cognitive Profile and Lexical Introduction:** Vocabulary in this band is heavily algebraic. Students must understand "powers," "base," "square root," and "standard form" in the context of systems of equations.15 They are introduced to the concept of a "linear" rate of change and "slope".15 Statistical vocabulary encompasses "box plots," "histograms," "quartiles," and "range," while geometry requires an understanding of "diameter," "radius," "complementary," "supplementary," and "vertical angles".15 Geometric transformations—"reflection," "rotation," and "translation"—are also introduced.15

**Curricular Mapping and Standards Alignment:** IXL mappings require students to write numerical expressions with one or two operations and analyze patterns by completing tables derived from graphs.16 Students also perform complex conversions between customary and metric units of measurement.16 Khan Academy heavily targets the fifth and sixth-grade expressions and equations standards, including 5.OA.A.1 (use parentheses, brackets, or braces in numerical expressions), 5.NBT.A.2 (explain patterns in the number of zeros of the product when multiplying a number by powers of 10), and 6.EE.A.1 (write and evaluate numerical expressions involving whole-number exponents).18

| Platform | Targeted Skill / Standard | Specific Problem Types |
| :---- | :---- | :---- |
| **IXL** | Numerical Expressions | Write numerical expressions with two operations. |
| **IXL** | Data and Patterns | Complete a table from a graph. |
| **Khan Academy** | 5.OA.A.1 | Evaluate expressions with parentheses. |
| **Khan Academy** | 5.NBT.A.2 | Understand powers of ten and exponent movement. |
| **Khan Academy** | 6.EE.A.1 | Basic exponents and powers of fractions. |

Table 7: Alignment of external platform skills to the 211-220 RIT Band.16

**Interaction Design and Answering Modalities:** Digital input via keypad is critical in this band. Students are frequently asked to solve a problem on physical scratch paper and type their final numerical answer into an empty box.9 Drag-and-drop mechanics are used to build equations synthetically; for instance, a student might drag numerical blocks and operation symbols (+, \-, \*, /) to construct an expression that accurately models a provided word problem.9 Multiple-choice formats are commonly deployed to test the simplification of expressions containing exponents and parentheses.9

### **RIT Band 221–230: Advanced Algebra and Trigonometric Foundations**

Students achieving scores in the 221-230 range are operating firmly at a middle school level (grades 6-8), engaging with complex equations, functions, and predictive statistical models. This represents the upper echelon of the standard MAP Growth assessment before transitioning into end-of-course exams.

**Cognitive Profile and Lexical Introduction:** The mathematical language becomes highly theoretical. Algebraically, students work with "dependent" and "independent variables," "substitution," and "exponential form".15 In data analysis, they must distinguish between "theoretical probability" and "experimental probability," calculate the "line of best fit," and understand "independent events".15 Advanced geometry introduces theorems surrounding "transversals," "interior/exterior angles," the "Pythagorean theorem," and foundational trigonometric concepts such as "cosine" and "radian measure".15 Furthermore, students navigate "rational functions" and "cube roots".15

**Curricular Mapping and Standards Alignment:** IXL correlates to this advanced band by focusing on solutions to inequalities. Students must determine which specific value for ![][image2] satisfies a given complex equation, and they are required to model and solve equations using digital algebra tiles.16 Khan Academy aligns its practice materials to CCSS 6.EE.B.7 (solve real-world and mathematical problems by writing and solving equations of the form ![][image3] and ![][image4] for cases in which ![][image5], ![][image6] and ![][image2] are all nonnegative rational numbers), 6.EE.A.2 (write, read, and evaluate expressions in which letters stand for numbers), and 6.EE.B.5 (testing solutions to inequalities).18

| Platform | Targeted Skill / Standard | Specific Problem Types |
| :---- | :---- | :---- |
| **IXL** | Equations and Inequalities | Solutions to inequalities; Does *x* satisfy an equation? |
| **IXL** | Algebraic Modeling | Model and solve equations using algebra tiles. |
| **Khan Academy** | 6.EE.B.7 | One-step equations with fractions and decimals. |
| **Khan Academy** | 6.EE.A.2 | Evaluating expressions with multiple variables. |
| **Khan Academy** | 6.EE.B.5 | Testing solutions to inequalities. |

Table 8: Alignment of external platform skills to the 221-230 RIT Band.16

**Interaction Design and Answering Modalities:** Interactive graphing is the cornerstone of item interaction at this level. Students must drag points to precise coordinates (e.g., placing a point exactly at ![][image7]) on a digital Cartesian plane.9 Another common drag-and-drop task involves moving numbers into specific superscript boxes to represent values using exponents (e.g., representing 64 as ![][image8] or ![][image9]).9 To increase the cognitive rigor and reduce the statistical probability of guessing, multiple-choice questions frequently expand to include five or more distractors (A, B, C, D, E).9

## **Digital Interaction Design and Advanced Answering Modalities**

To accurately simulate the authentic MAP Growth environment, a practice platform's front-end architecture must support a diverse array of Technology-Enhanced Items (TEIs). Relying solely on traditional radio-button multiple choice is fundamentally insufficient for replicating the assessment's cognitive load and construct validity.19 The following interaction paradigms must be engineered into the platform.

### **Drag-and-Drop Input**

Drag-and-drop interactions are utilized across all RIT bands to assess spatial reasoning, sequencing, and categorization.19 The interface must feature snap-to-grid mechanics and reset buttons to prevent user frustration.19

* **Early Elementary Implementation:** Moving visual objects to solve arithmetic, such as dragging images of apples into a basket to model addition, or moving specific shapes onto a designated digital sorting mat.9  
* **Upper Elementary Implementation:** Moving virtual base-ten blocks to physically model subtraction with regrouping, dragging fractions to their correct hierarchical placement on an interactive number line, or dragging digits into a place value table to demonstrate base-ten comprehension.9

### **Hot Text and Hotspot Selection**

Hotspots allow students to click directly on graphical elements to indicate their answer, testing visual discrimination and data interpretation without relying on text.19

* **Early Elementary Implementation:** Clicking on the tallest student in a visual lineup or selecting a specific object from a mixed group.9 Hit-boxes must be generously sized to accommodate the developing fine motor skills of younger students.  
* **Upper Elementary Implementation:** Clicking specific data points on a scatter plot, selecting a specific line of symmetry within a complex polygon, or identifying acute angles within a composite shape.9 The platform must support the rendering of polygons and custom vector paths as clickable areas.21

### **Multi-Select (Evidence-Based Selection)**

Multi-select items require students to identify more than one correct answer from a list, eliminating the ability to guess via simple elimination.19

* **Implementation:** These questions must utilize square checkboxes rather than circular radio buttons to denote that multiple answers are expected. Prompts typically read "Choose ALL that apply." Examples include selecting all equations that yield a sum of 15, or selecting all shapes that possess the properties of a quadrilateral.9

### **Keypad and Equation Entry**

Also known as Short Answer or Text Input, these items require students to generate the mathematical answer from scratch rather than recognizing it from a list of distractors.19

* **Implementation:** A digital keypad should appear on-screen to allow for mouse-click entry (which is crucial for tablet users), alongside standard physical keyboard support. In higher RIT bands (200+), the keypad must dynamically update to include fraction bars, decimal points, exponents, and negative signs.9

## **Accessibility Frameworks, Calculators, and Embedded Tools**

A defining feature of the MAP Growth assessment is its strict adherence to universal design principles. The platform provides embedded tools and accommodations to reduce construct-irrelevant variance, ensuring the test strictly measures mathematical skills rather than digital fluency or reading comprehension.1 Practice platform developers must integrate the following tools conditionally, based on the user's RIT level, grade, and specific item metadata.

### **Text-to-Speech and Auditory Scaffolding**

Because mathematical capability develops independently of reading fluency, the interface must handle audio dynamically.

* **K-2 Paradigm:** Items present visuals with little to no text. Pre-recorded audio reads the question prompt automatically upon loading.9 The practice platform must include an auto-play audio feature for grades K-2, alongside a prominent replay button so students can hear the prompt multiple times.  
* **3-5 Paradigm:** The 2-5 test assumes independent reading capability. Audio support shifts from a default, auto-play feature to a designated accommodation (Text-to-Speech) that can be manually toggled on for students with specific learning profiles by an administrator or teacher.11

### **Calculator Availability and Algorithmic Restrictions**

One of the most critical and easily misunderstood technical specifications for developers is the conditional availability of on-screen calculators. Providing a calculator when the item was calibrated to be solved without one drastically alters the item's difficulty, effectively giving the student an unfair advantage and invalidating the RIT measurement.25

* **The Baseline Rule:** The MAP platform utilizes the Desmos four-function and scientific calculators.25  
* **K-2 Prohibition:** Calculators are strictly prohibited in the K-2 band. No items in the K-2 item bank contain an embedded calculator.25  
* **The "Grade 6 Standard" Trigger:** Calculator availability is highly restricted in the 2-5 test. The calculator is *not* determined by the student's physical grade level; it is triggered exclusively by the metadata of the specific item being presented. The calculator only appears on test items aligned to educational standards for Grade 6 and higher.25  
* **Implication for Developers:** If a highly advanced 5th grader scoring in the 221-230 RIT band encounters a 6th-grade standard item (e.g., complex rational numbers), the system must render the calculator icon. However, if that same 5th grader is presented with an item testing a 5th-grade standard (e.g., multi-digit multiplication), the calculator must be hidden.25 A practice platform must govern calculator visibility with a strict boolean flag linked to the item's underlying standard taxonomy.

### **Global Embedded Utilities**

Regardless of RIT band, the platform should feature several universal digital aids to perfectly simulate the cognitive environment of the assessment:

* **Digital Notepad/Scratchpad:** A persistent digital space allowing students to perform scratch work using a mouse or stylus, mimicking physical scratch paper.22  
* **Highlighter:** A tool that allows students to mark critical information, numerical values, or keywords within dense word problems to aid in reading comprehension.22  
* **Answer Eliminator:** A functional tool that enables students to place a visual red "X" over multiple-choice options they have logically deduced are incorrect, reducing cognitive load as they deliberate between remaining options.22  
* **Virtual Measurement Tools:** Items assessing measurement should feature draggable digital rulers and protractors directly within the item pane, which students must manipulate to measure on-screen elements.22

## **Synthesis and Architectural Implications for Platform Developers**

To successfully architect a mathematics practice platform that prepares K-5 students for the MAP Growth assessment across RIT bands 161 to 230, development teams must move beyond simplistic quiz generators and embrace the complex, metadata-driven architecture of modern psychometric platforms.

First, developers must adopt a highly granular database schema. Categorizing questions solely by generic labels such as "Grade 3" is insufficient. Every practice item must be tagged with a precise CCSS alignment, an estimated RIT difficulty score, and flags for calculator permissions. Utilizing the Khan Academy mappings and IXL skill progressions as the foundational taxonomy will ensure high content validity.

Second, the front-end interface must render different UI paradigms dynamically based on the student's profile. If the user is operating within the K-2 environment (RIT \< 190), the system must default to large hit-boxes, minimal text, and mandatory audio playback. For users in the 3-5 environment, the system must present standard text-based word problems, offering text-to-speech solely as an accessibility toggle.

Third, developers must invest heavily in robust HTML5 interactions. The capacity to drag fractions onto number lines, move base-ten blocks to model regrouping, and plot coordinates on a Cartesian plane are not extraneous features; they are the core mechanisms by which higher-level mathematical thinking is assessed in the modern era. By aligning the visual complexity, algorithmic difficulty, and interaction mechanics synchronously with the RIT target, a practice platform can provide a genuinely authentic and developmentally optimal learning environment.

#### **Works cited**

1. MAP Growth Technical Report for 2024–2025 | NWEA, accessed April 21, 2026, [https://www.nwea.org/uploads/MAP-Growth-Technical-Report-2025.pdf](https://www.nwea.org/uploads/MAP-Growth-Technical-Report-2025.pdf)  
2. MAP Growth Mathematics to Khan Academy, accessed April 21, 2026, [https://www.pvusd.net/documents/Departments/Teaching--Learning/Assessment-and-Accountability/NWEA/Geometry.pdf](https://www.pvusd.net/documents/Departments/Teaching--Learning/Assessment-and-Accountability/NWEA/Geometry.pdf)  
3. MAP to Khan Academy: \- Dearborn Public Schools, accessed April 21, 2026, [https://dearbornschools.org/mcdonald/wp-content/uploads/sites/37/2014/11/Khan-PDF-2-5-March-2015\_0.pdf](https://dearbornschools.org/mcdonald/wp-content/uploads/sites/37/2014/11/Khan-PDF-2-5-March-2015_0.pdf)  
4. NWEA MAP Test Scores 2026 Guide \[Chart By Grade Level\] \- GiftedReady, accessed April 21, 2026, [https://www.giftedready.com/nwea-map/test-scores/](https://www.giftedready.com/nwea-map/test-scores/)  
5. MAP Test Practice and MAP Test Scores by Grade Level \- Testing Mom, accessed April 21, 2026, [https://www.testingmom.com/tests/nwea-map-test/map-grades-scores/](https://www.testingmom.com/tests/nwea-map-test/map-grades-scores/)  
6. MAP Scores by Grade Level 2026 Explained | NWEA MAP Growth Guide \- TestPrep-Online, accessed April 21, 2026, [https://www.testprep-online.com/map-scores](https://www.testprep-online.com/map-scores)  
7. MAP Growth with enhanced item-selection algorithm: Updates on score comparability \- NWEA, accessed April 21, 2026, [https://www.nwea.org/uploads/Research-MAP-Growth-with-enhanced-item-selection-algorithm-updates-on-score-compatibility\_NWEA\_Research\_Guide.pdf](https://www.nwea.org/uploads/Research-MAP-Growth-with-enhanced-item-selection-algorithm-updates-on-score-compatibility_NWEA_Research_Guide.pdf)  
8. MAP Growth grade-level test guidance (K–2/2–5), accessed April 21, 2026, [https://teach.mapnwea.org/impl/GradelevelTestGuidance.pdf](https://teach.mapnwea.org/impl/GradelevelTestGuidance.pdf)  
9. RIT Reference Charts \- Nwea, accessed April 21, 2026, [https://cdn.nwea.org/docs/RIT+Reference+Brochure\_July19\_CC.pdf](https://cdn.nwea.org/docs/RIT+Reference+Brochure_July19_CC.pdf)  
10. NWEA MAP Math Explained, Samples Questions & Practice Tests \- Tests.School, accessed April 21, 2026, [https://tests.school/nwea-map-test-math/](https://tests.school/nwea-map-test-math/)  
11. NWEA® MAP® Growth \- Math \- Homeschool Boss, accessed April 21, 2026, [https://homeschoolboss.com/map-growth-math/](https://homeschoolboss.com/map-growth-math/)  
12. MAP Growth K–2 reading & mathematics content \- NWEA, accessed April 21, 2026, [https://www.nwea.org/resource-center/fact-sheet/48194/MAP-Growth-K-2-reading-and-mathematics-content\_NWEA\_onesheet.pdf/](https://www.nwea.org/resource-center/fact-sheet/48194/MAP-Growth-K-2-reading-and-mathematics-content_NWEA_onesheet.pdf/)  
13. Learning Continuum Math RIT Skills Tracker \- NWEA MAP Prep by Lahti's Mathroom \- TPT, accessed April 21, 2026, [https://www.teacherspayteachers.com/Product/Learning-Continuum-Math-RIT-Skills-Tracker-NWEA-MAP-Prep-2091279](https://www.teacherspayteachers.com/Product/Learning-Continuum-Math-RIT-Skills-Tracker-NWEA-MAP-Prep-2091279)  
14. RIT to Concepts Reference for K–2 \- NWEA Maps, accessed April 21, 2026, [https://teach.mapnwea.org/impl/RIT2ConceptK2.pdf](https://teach.mapnwea.org/impl/RIT2ConceptK2.pdf)  
15. RIT to Concepts Reference \- NWEA Map, accessed April 21, 2026, [https://teach.mapnwea.org/impl/RITConceptsReference.pdf](https://teach.mapnwea.org/impl/RITConceptsReference.pdf)  
16. IXL skill plan | Math grades 2-5 plan for the New York NWEA MAP ..., accessed April 21, 2026, [https://www.ixl.com/math/skill-plans/ny-nwea-map-growth-2-5](https://www.ixl.com/math/skill-plans/ny-nwea-map-growth-2-5)  
17. MAP Growth Mathematics to Khan Academy \- Nwea, accessed April 21, 2026, [https://cdn.nwea.org/docs/MAP+Growth+Grades+K-2+to+Khan+Academy.pdf](https://cdn.nwea.org/docs/MAP+Growth+Grades+K-2+to+Khan+Academy.pdf)  
18. MAP Growth Mathematics to Khan Academy, accessed April 21, 2026, [https://www.pvusd.net/documents/Departments/Teaching--Learning/Assessment-and-Accountability/NWEA/Operations-and-Algebraic-Thinking.pdf](https://www.pvusd.net/documents/Departments/Teaching--Learning/Assessment-and-Accountability/NWEA/Operations-and-Algebraic-Thinking.pdf)  
19. Guide to Assessment Item Types, accessed April 21, 2026, [https://education.alaska.gov/assessments/Science\_ItemTypes.pdf](https://education.alaska.gov/assessments/Science_ItemTypes.pdf)  
20. MAP Growth Mathematics to Khan Academy \- Nwea, accessed April 21, 2026, [https://cdn.nwea.org/docs/MAP+Growth+Grades+6%2B+to+Khan+Academy.pdf](https://cdn.nwea.org/docs/MAP+Growth+Grades+6%2B+to+Khan+Academy.pdf)  
21. How do I create a Hot Spot question in New Quizzes? \- Instructure Community, accessed April 21, 2026, [https://community.instructure.com/en/kb/articles/661056-how-do-i-create-a-hot-spot-question-in-new-quizzes](https://community.instructure.com/en/kb/articles/661056-how-do-i-create-a-hot-spot-question-in-new-quizzes)  
22. Accessibility and accommodations in MAP Growth \- NWEA, accessed April 21, 2026, [https://www.nwea.org/uploads/2019/12/NWEA-Accessibility-and-Accommodations-FAQ-JAN2020.pdf](https://www.nwea.org/uploads/2019/12/NWEA-Accessibility-and-Accommodations-FAQ-JAN2020.pdf)  
23. RIT Reference Charts \- Nwea, accessed April 21, 2026, [https://cdn.nwea.org/docs/RIT+Reference+Brochure\_July19.pdf](https://cdn.nwea.org/docs/RIT+Reference+Brochure_July19.pdf)  
24. Accommodations \- NWEA Map, accessed April 21, 2026, [https://teach.mapnwea.org/assist/help\_map/Content/Testing/accommodations.htm?Highlight=assign%20accommodation](https://teach.mapnwea.org/assist/help_map/Content/Testing/accommodations.htm?Highlight=assign+accommodation)  
25. Calculators on MAP Growth tests \- NWEA Connection, accessed April 21, 2026, [https://connection.nwea.org/s/article/Calculators-on-MAP-tests](https://connection.nwea.org/s/article/Calculators-on-MAP-tests)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG0AAAAXCAYAAAABQcHxAAADfUlEQVR4Xu2YW6gOURTHl1CECDmu+YgHIcktt5yEiAfJg3jwQAiRJyV0XhSRpFxT4oXiRXJ5UE55QJRLoZRCSvEgihe5/P+z9j7fnjl7HxNm5ju1//Xr+2bPnpm91tp77TUjEhUVFRXVidQFDAWzwABz3JFGgO7ZxgrV0XhozzwDbfTZxmvHg+mGHunTjae+4DTYDdaAR+CGaadoJKHxC8B58AoMMefLVnYsofEwELTpClhlOAOOmXNWY8FVsAGsM9wDK5w+DaeN4DOYbY7ngO+gxRxz1pEdYC04Ct5IeyeVpexYQuNZKDoBm5y2nuA62GSOea+TooFzNQbcBaMy7Q2jGLROGDSmg5/ml5oGvommEp92it9JVYhj8Y2HKfQsuAy6Oe0Ug3wL9BK95iGYkOoh0kc0rU7KtCeb5xbR3Ex48xmmrUyH0EAaYLUV/BCdqT75nFSVQkGj0++Ac06bldu/N2gFH0XtpS/IfHBBdGW2aTnYB0ZKfTPlclwPdoGbknZk0eJAB4lu1s/BZtPmk89JIXUVvS/75oGpLFQF+hQKGv+zLRS0L1JfRawqP4Ff4JnhEhhszidi5XNI6lFkkMgD0dz6RDTK2WVdpPisZtHqkZUjV1vIeT4nhUQbl4CVOeFkHphcmU9/G7SvYIo55hhbRAPJwBHu8cvEmbh0hl1F3AivGZhr7XnO0JD6gf2iZfqfOA7G6WW5xfzOmXdE/KvN56Sq9K9BY8Auiu7nnLirDTzvBjalYeC1gbO8CjGvuy/U1uB3YLjt5MjnpKoUClrePY21BN/RUnuXaPX4UjQDJuJKahZNA7yImyCxOZY3m2v+Fym+PBO+SLo53gbtPRht2lz5nBRSf9H9+W1OXoCpyZX5FAoaJyCrR2aw7NcNVsWtopOVrzu+wFIMGOuORMzxLLGXggOiD7QP5cO2g5m2c4Hi7CJ0Ksteu6psegztqz4nVaVQ0KjFovVBk9Nm7eWeTdHPj0HNdjDiwmJx2FZBTwa3wV6wR/R9gBwEp0TTJINXljiz74NtUv+MxfeYVPUEHRZNmXwd4Gb9ATwFE91OJckdS2g8dPwJ0cnHiUi4SHjsfqJjAFkx8jMW7SdMme0qaC5ZFhQUiw5bGmeXclmigQweq7ealDtpihTtqIlWgoT/fbYxiIscbFBTikErR/81aFFRUVFRUVFRpes36ErUtgqH/ooAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAaCAYAAABhJqYYAAAAsUlEQVR4Xu3QvwpBYRzG8Vf+pFDKICMuwSaTGN2AkUEGKaNZcQnugMGgXImJ0Q24B9/neFDKcDbDeepT5+339J5zfiEk+duk0LIxamhibjq/M8PQejhjFT7lI/Iq1rEMz9ulgSs6LskOGZWzyOnB0c0XVD2T9GsYq/ydBQ7Br/1OAV2UTEX9g1Kxts9hgjv6dsPAs5Hp06KosMfWNjhhjalpS/HLSjk8lx4tnhQtyc88AGI7HX5yGejgAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAYCAYAAABtGnqsAAAClUlEQVR4Xu2XTchMURjHH6HI93dCSlFW8pUUhSxe2fjaIQoRRZSNYmchStn5yMKGhZKFetkQxUKRhazkIxGysbOR/2+e544zt3mnO3cyM73ur369773n3Jkzzznnec41q6ioqKioqBheLAn35BsqirE8PJRvGM7Mk0fCjXKUXBXXs5N+RSgbwBHm37lLTpTTwr1yhxxb79ldGMNWuT2cIJfJGVmHLfKsnB/ekM/kfnlKDspxWecClA3ganlSXpRv5NVwsTwu78vx9d6NjJQzzSe7iLPk6NqTrdksX5hP7Ibwg3wlp9OB6F6wxtklaM/lQvOON81XZFHKBvC0ebCuycdyUgh83le5Jq7zMP5N5iu1iCyaWgBasNT8OwfimknCW/K2RUyYhWx1jQnvyUtxj3YeGgoGfSXnnfBpk7bD1vzz2L5TzCeUyWMSU/ie3/G3GxAcFg5jYVxAwPG1PBj3qgAOQeEApswJ38udjU1tUXYLA1v4s3khSyFH/zBv7wbkyLf2dyHByvCbJamEFbbOPLIMGr+bn+OAhLs2/i9KJwFk4j7Juck9Cscja52Lp5oXu48FpUitqD3ZHH7/T2tcSKw6ZAXW82e2Nag250KqDIFjWx0zr47t0EkAmXF+HCsgg6MDxYwTQrfItuq2uKaYUdiwXkCASvNQnjGvgnhXnpeXzWeAQLZD2QCSa8g5L+V18zHhA7ko6dctCN4TedT8CPUrPJF2AgrH5OQ6O1NxvwxlA5jmP7YtY0rH1QuIAYWNcyC5ryH//SvIR0hBagdW+xe5IN/QB5D7KCqYppe+gBSx3nzrsgL3mU9AP8A4Dsh35mPD3da718qmVAHsEAJInsneU8m/zQ7bvYAcmH+P7qfxVfzX/AGaNY1Bz59zTgAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAYCAYAAACvKj4oAAACK0lEQVR4Xu2WP0hVYRjGn6gk0/JfVFKYtkggKKhBUTQUWtDgYCAEETkkaCKRCi66iENbbRVFQ5OBk+DgEi5lEC0RBA5KJdgQtbVEz3Pf95z73cutbg1HvZwHflzO9733nPff954DpEqVKlWqVKmaST+pJxXOFXKd7M+aYTfpIoOO7LU/QC6QnVnTRCV/Lzl95AAspuPabCIz5BZZI3NOOyzIZXKUVJEH5CwsGLFCnpLz5C3sAb+Tgj8IS0oxHIIl9G9qI2/IZacV5ssnckIGN2DO3oY53OhIetAquUqukW5fV8Dio+/pHj/IKd8vpHJYAnqLpAdWiT9JPrwnQ3nrk+Q1qdGFKrOXPCfPyA5HUja+w4Lfh2wLRhX8DMuS7Mt8L0lNkXV4K7r2kHlyL1oo+QAltcI7cjNchLXfT1gwocaduA02QRosi7BgFFSk8OjEOkM2SGewpqo8IS9hVT5GTsPOkm4qHsXWwEVSHVznq5YswAZZMehsdWT+WVgaQpoZ03nrYWfFUuW+kpZg7ST54L9RtoSmlpIhVEWpEfagXX6dhKJWnPBrTVyhouR0lpzS+VM2ZmHnTbwg5wKb++QueUjuOEtkjDwmh902SanCr8gwsq+3b8jtrJzzp6zUOdGgiaRrtVn4bqpEYdskJX8UQ4NT8PypPfW7nRVN9i+w6R9LfayX9Cg5Em5sE2no6fNMw1AolhFYt2VU8gH+67ffVpN8lu//8x2basvrF3jcc+bRPgjCAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAy0lEQVR4Xu3RPQtBcRgF8EcZ5CWKEpnMSpLVZFE2izLaDJSvYPMZfAGyWmRQymL1tpp9Cee453IT5ZZMTv2W557b/7n3b/bPzxOAKrQkDGXoS8YtFqAHE9lCByqygByLHJZgLkNzTonKCtosxiALR6lxiKRkDwNfRYa7nCSvWVEu9nj5tsNSIp4Z8ZS0ZjaGmQQhbs7XUtMtccc1bGQEU+gK/4C/Ipc/mHMblICQ+9CbOuzs8TvehgufoSH8mJfhpVNS7js95+Pid3MFEOsqlQwWoAQAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAZCAYAAADjRwSLAAAAwUlEQVR4Xu3QrQoCQRiF4TEIIgZNIoiiQTAZBdFm8Rq8C21GwWYSbDavweItmI02f7pgMAi+x/0Gdteyi9UDT5jZj5mz49w/aZNBy4wxQB79VENZLLE1dczwwMoPTXFE2Sg1XFxwqmvgjIV99BniirYWI7xsMxxdd0BJiwluaIYGcti5UB+dcELVb5CuC0p/+iiJhvT7a2wwN+pyR8cP+RRRMJHS8aiwL62Tv6L30KvLE3v0IhMuuK4So71IEg39ljfERSJsoa4VwwAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAWCAYAAACR1Y9lAAAChUlEQVR4Xu2XTYhOURjHH6F8RTLTpChTNj4KMQuTRCxYUD6KwkoUKTKZKVm8FgobYpKkJFtlYaGkKBuxIh+FBSsLZaGsJP7/9/yf6dwzd+573+6daTLzq19v7znnve997nmec841m2SS/4Ip8IjckfSNd47BQxZioIXsgadly8El2CW3wYWyFx6FM6JxZfAAlsPL8AbcqDYyDV61EAMdkaXwMeySdXBX/o38DFfHg0owHZ6TvN4CuAJ+hOujcd3wiVwctWeYMIE2ZJ0MylNwL1wGp2ZGlGMffC19Eg7D33CTvhOmsf9nI2ofogO+hBvSjopcl2vTjjaYB1/A27IV2yXjmZ/0NW/kDVyUdlTEAz0Ir8EHFhaKdmZ1FfwJL8oL8B58DnuicQ6zhr7TZwZuJa8s5wlU5Iw8D2fK+/CWhborA2eHtf1BLlH7ZvjFQq3G+Or+CW5N+pqBPoNzknbCG9piocZayevMDT9rMkvGM7gb/rFsbRXhgTIjqMNgviZt3u59w84CoxEoZ49PnXaojXAMb5x7dRlYVr/ggHQ8GGYI99C4vTDQulPXZ4LejNo90ANRWxF8SKy3s9LxYLjdxBSmLov6rdW7GK2EDyX3PcLl/5KFm/B9jovNN8ltKIW/4YmHCxn12uZMf4c79d0pXIz41OreXniDx+UduN/CivnesqvlGvhDcqPPK59O+EhesZANzMA+G35U9e3lqeVca8IEysGDNsJpogaYuqzNdZa/rcyWDcu5OcGVmzIdea28Y6rHQU8kfUNwP+JTqPOsWxbWMz2ZdrRJt5U46xK+h/bLNCVGC86gz0KVxbD0axphcGP94s3/9LSsAt9xWbu83lhN0vjjH6Wdk6ZOAk+GAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAXCAYAAADtNKTnAAABM0lEQVR4Xu3TvytFYRzH8a8uRcRAGa5FKVF+lJLBYDAwKLH4MckiShZ/gGwmRSlZDAwmA1nsRpMM2OzyB/jx/tzn272P0z0OpWu5n3p1Os/5nu95zvOcY1bh5DCEHqfzX6UBa+jDtrtAU1yUFd38iAG0uVuMx0VZ+XGTbuy4QyxYeA1F79/qx7xTE61RMaM4QLNT8Twu0RLV1WAzovNC6nFqia6kFmeYjMamseG+7E4jrnFipZkoWvlzKzXXeqiJni4jGPRrhcziDa9uGbtYtXBDB+7xEXn28WJUuIR3p6I79MZFWfmTJjO4srDNsmeh0QuGo7rUdOIGXYnxfjzhKDFeNhMWdqfcf7Bo4VvRZ/Bt0maiddrCSmI8NVqTB6y7ORxjH3VRXWY05TE3hfb4YjX/kE/ZJzbbdT59MgAAAABJRU5ErkJggg==>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAXCAYAAADtNKTnAAABD0lEQVR4XmNgoDNgBmI1IFaGYhCfJMACxNVAbAHE8VC8Hoh5kBURAtxAvAKI7YHYGIovALEksiJCgCxDGIG4AIgz0MRB4VAFxY0MEHU4gS0Q/wTiciQxULg4AHEzFIcz4DBEBoo3AvFXBlRDOKA0yAsgfIsBYigKYAXiTij2BuKHDAhD9IH4LpSGGfIAiD2h8nAQBMRJUAxShGwIPxBPZYDYDAonEF7IgBbFCgwQF4BcA8LohoAAKFDFgFgYijHCQ4GBQkNgYaGAJIbNELwgGYhnA3EIEk4F4vdAvJQBEniccNU4gCYDqgEgDHLBbwYSDMEGQMkaPZ0QBWD5A4RfAfF/IP4CxIcZIAE6CoYkAADGCzBlXXV8wQAAAABJRU5ErkJggg==>