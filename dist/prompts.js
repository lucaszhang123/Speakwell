// Speaking prompts are bundled locally; no API call is needed to pick a topic.
const originalTopics = {
  everyday: [['Candy', 'What makes a childhood favorite so memorable?'], ['Polar bears', 'What could we learn from life in an extreme environment?'], ['Rainy days', 'Tell a story about finding something good in a gloomy day.'], ['Coffee', 'Explain the ritual behind an everyday drink.'], ['A favorite book', 'Share one idea that stayed with you.'], ['Bicycles', 'Why does a simple invention make such a difference?'], ['Street food', 'Take your audience on a tour of your favorite flavors.'], ['Houseplants', 'What can caring for something small teach us?'], ['Board games', 'What makes a game worth playing again?'], ['Music', 'Describe a song through the memory it brings back.'], ['The ocean', 'Explain what fascinates you about the sea.'], ['A perfect weekend', 'Walk us through your ideal way to recharge.'], ['Your morning routine', 'Describe one part of your routine that sets the tone for your day.'], ['A place you would revisit', 'Take your audience there and explain why you would go back.'], ['The best meal you have had', 'Describe the meal and the memory that makes it stand out.'], ['A small act of kindness', 'Tell a story about a kind gesture and why it mattered.'], ['A useful object', 'Choose an everyday object and explain why it deserves more appreciation.'], ['A family tradition', 'Describe a tradition and what it says about the people involved.'], ['Your ideal classroom', 'Explain what it would feel like to learn there.'], ['A skill everyone should learn', 'Name the skill and give a practical reason it matters.'], ['A memorable celebration', 'Tell the story of a celebration and the moment you remember most.'], ['A piece of advice', 'Share advice that has helped you, and explain when it is useful.']],
  discovery: [['The Mpemba effect', 'Research when warmer water may freeze sooner than cooler water. Explain the conditions and the uncertainty.', 'Mpemba effect'], ['The doorway effect', 'Research why walking into a new room can affect recall. Explain an experiment and its limits.', 'doorway effect memory'], ['The cocktail party effect', 'How do we attend to one voice in a crowded room? Research a possible explanation.', 'cocktail party effect auditory attention'], ['Slime mold navigation', 'Research how slime molds form networks. Explain what the findings do and do not show.', 'Physarum network formation'], ['The rubber hand illusion', 'Research how a simple illusion changes our sense of body ownership.', 'rubber hand illusion'], ['Sonoluminescence', 'Research how collapsing bubbles can emit light. Explain what remains uncertain.', 'sonoluminescence'], ['The Leidenfrost effect', 'Research why a droplet can glide over a very hot surface.', 'Leidenfrost effect'], ['The missing satellite problem', 'Research the gap between predicted and observed small satellite galaxies.', 'missing satellites problem'], ['Tardigrades', 'Research how tardigrades survive harsh environments and separate established evidence from popular claims.', 'tardigrade survival mechanisms'], ['Bioluminescence', 'Explain why some living things produce light and how that ability helps them.', 'bioluminescence function'], ['The placebo effect', 'Explain what researchers mean by the placebo effect and why it matters in clinical studies.', 'placebo effect clinical trials'], ['Ant communication', 'Research how ants communicate and give one example of how a colony uses that information.', 'ant communication pheromones'], ['The Great Red Spot', 'Explain what scientists know about Jupiter’s Great Red Spot and what remains uncertain.', 'Jupiter Great Red Spot research'], ['The science of sleep', 'Describe one important role sleep plays and explain the evidence behind it.', 'sleep function research'], ['CRISPR', 'Explain the basic idea behind CRISPR and one question it raises.', 'CRISPR gene editing overview'], ['The Northern Lights', 'Explain how auroras form and why they appear near the poles.', 'aurora borealis science'], ['The microbiome', 'Explain what the human microbiome is and why scientists study it.', 'human microbiome overview'], ['Black holes', 'Explain one way scientists detect black holes even though light cannot escape them.', 'how scientists detect black holes']],
  argument: [['What is one policy you would enact if you were president?', 'Explain your proposal, acknowledge a tradeoff, and consider an objection.'], ['What makes a good leader?', 'Choose one quality and defend it with a concrete example.'], ['Should schools start later?', 'Make a case, acknowledge a tradeoff, and respond to an objection.'], ['Is talent or practice more important?', 'Choose your position and explain the strongest reason for it.'], ['Should everyone learn a musical instrument?', 'Build an argument with a clear claim, example, and conclusion.'], ['Is competition good for creativity?', 'Defend your view while considering the other side.'], ['Should a four-day workweek be the norm?', 'Explain a benefit, a cost, and how you would weigh them.'], ['Would you rather explore space or the ocean?', 'Choose where to focus and support your argument.'], ['Should homework be limited?', 'Make a clear case and address one concern about your position.'], ['Are phones helpful in class?', 'Choose a position and explain what rule you would adopt.'], ['Should voting be mandatory?', 'Defend your position while considering individual choice.'], ['Is social media good for friendship?', 'Make an argument that includes both a benefit and a drawback.'], ['Should public transit be free?', 'Explain who would benefit, what the cost might be, and your conclusion.'], ['Should cities plant more trees?', 'Make your case with one concrete benefit and one realistic challenge.'], ['Should college be free?', 'Explain your position and respond to one likely objection.'], ['Should athletes be paid in college?', 'State your view and use one reason that matters most.'], ['Is artificial intelligence more helpful or harmful in school?', 'Choose a side, define one limit, and support your argument.'], ['Should schools require community service?', 'Argue for or against the requirement with a clear example.']],
};

const additions = {
  "everyday": [
    [
      "A surprising gift — the story",
      "Tell a real or imagined story about a surprising gift. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A surprising gift — the details",
      "Bring a surprising gift to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A surprising gift — a different perspective",
      "Consider a surprising gift from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A missed bus — the story",
      "Tell a real or imagined story about a missed bus. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A missed bus — the details",
      "Bring a missed bus to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A missed bus — a different perspective",
      "Consider a missed bus from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "Your favorite breakfast — the story",
      "Tell a real or imagined story about your favorite breakfast. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "Your favorite breakfast — the details",
      "Bring your favorite breakfast to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "Your favorite breakfast — a different perspective",
      "Consider your favorite breakfast from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A neighborhood walk — the story",
      "Tell a real or imagined story about a neighborhood walk. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A neighborhood walk — the details",
      "Bring a neighborhood walk to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A neighborhood walk — a different perspective",
      "Consider a neighborhood walk from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A family recipe — the story",
      "Tell a real or imagined story about a family recipe. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A family recipe — the details",
      "Bring a family recipe to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A family recipe — a different perspective",
      "Consider a family recipe from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A childhood game — the story",
      "Tell a real or imagined story about a childhood game. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A childhood game — the details",
      "Bring a childhood game to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A childhood game — a different perspective",
      "Consider a childhood game from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "An unexpected visitor — the story",
      "Tell a real or imagined story about an unexpected visitor. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "An unexpected visitor — the details",
      "Bring an unexpected visitor to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "An unexpected visitor — a different perspective",
      "Consider an unexpected visitor from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A rainy commute — the story",
      "Tell a real or imagined story about a rainy commute. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A rainy commute — the details",
      "Bring a rainy commute to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A rainy commute — a different perspective",
      "Consider a rainy commute from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "An old photograph — the story",
      "Tell a real or imagined story about an old photograph. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "An old photograph — the details",
      "Bring an old photograph to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "An old photograph — a different perspective",
      "Consider an old photograph from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A handwritten note — the story",
      "Tell a real or imagined story about a handwritten note. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A handwritten note — the details",
      "Bring a handwritten note to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A handwritten note — a different perspective",
      "Consider a handwritten note from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A helpful stranger — the story",
      "Tell a real or imagined story about a helpful stranger. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A helpful stranger — the details",
      "Bring a helpful stranger to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A helpful stranger — a different perspective",
      "Consider a helpful stranger from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A long queue — the story",
      "Tell a real or imagined story about a long queue. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A long queue — the details",
      "Bring a long queue to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A long queue — a different perspective",
      "Consider a long queue from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A crowded elevator — the story",
      "Tell a real or imagined story about a crowded elevator. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A crowded elevator — the details",
      "Bring a crowded elevator to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A crowded elevator — a different perspective",
      "Consider a crowded elevator from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A quiet library — the story",
      "Tell a real or imagined story about a quiet library. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A quiet library — the details",
      "Bring a quiet library to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A quiet library — a different perspective",
      "Consider a quiet library from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A noisy restaurant — the story",
      "Tell a real or imagined story about a noisy restaurant. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A noisy restaurant — the details",
      "Bring a noisy restaurant to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A noisy restaurant — a different perspective",
      "Consider a noisy restaurant from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A school lunch — the story",
      "Tell a real or imagined story about a school lunch. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A school lunch — the details",
      "Bring a school lunch to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A school lunch — a different perspective",
      "Consider a school lunch from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A picnic — the story",
      "Tell a real or imagined story about a picnic. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A picnic — the details",
      "Bring a picnic to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A picnic — a different perspective",
      "Consider a picnic from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A camping trip — the story",
      "Tell a real or imagined story about a camping trip. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A camping trip — the details",
      "Bring a camping trip to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A camping trip — a different perspective",
      "Consider a camping trip from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A day at the beach — the story",
      "Tell a real or imagined story about a day at the beach. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A day at the beach — the details",
      "Bring a day at the beach to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A day at the beach — a different perspective",
      "Consider a day at the beach from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A snowy afternoon — the story",
      "Tell a real or imagined story about a snowy afternoon. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A snowy afternoon — the details",
      "Bring a snowy afternoon to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A snowy afternoon — a different perspective",
      "Consider a snowy afternoon from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A power outage — the story",
      "Tell a real or imagined story about a power outage. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A power outage — the details",
      "Bring a power outage to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A power outage — a different perspective",
      "Consider a power outage from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A lost umbrella — the story",
      "Tell a real or imagined story about a lost umbrella. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A lost umbrella — the details",
      "Bring a lost umbrella to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A lost umbrella — a different perspective",
      "Consider a lost umbrella from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A borrowed jacket — the story",
      "Tell a real or imagined story about a borrowed jacket. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A borrowed jacket — the details",
      "Bring a borrowed jacket to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A borrowed jacket — a different perspective",
      "Consider a borrowed jacket from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A broken phone — the story",
      "Tell a real or imagined story about a broken phone. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A broken phone — the details",
      "Bring a broken phone to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A broken phone — a different perspective",
      "Consider a broken phone from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A new pair of shoes — the story",
      "Tell a real or imagined story about a new pair of shoes. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A new pair of shoes — the details",
      "Bring a new pair of shoes to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A new pair of shoes — a different perspective",
      "Consider a new pair of shoes from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A favorite mug — the story",
      "Tell a real or imagined story about a favorite mug. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A favorite mug — the details",
      "Bring a favorite mug to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A favorite mug — a different perspective",
      "Consider a favorite mug from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A messy desk — the story",
      "Tell a real or imagined story about a messy desk. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A messy desk — the details",
      "Bring a messy desk to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A messy desk — a different perspective",
      "Consider a messy desk from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A lucky find — the story",
      "Tell a real or imagined story about a lucky find. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A lucky find — the details",
      "Bring a lucky find to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A lucky find — a different perspective",
      "Consider a lucky find from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A small celebration — the story",
      "Tell a real or imagined story about a small celebration. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A small celebration — the details",
      "Bring a small celebration to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A small celebration — a different perspective",
      "Consider a small celebration from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A disappointing purchase — the story",
      "Tell a real or imagined story about a disappointing purchase. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A disappointing purchase — the details",
      "Bring a disappointing purchase to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A disappointing purchase — a different perspective",
      "Consider a disappointing purchase from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A cooking mistake — the story",
      "Tell a real or imagined story about a cooking mistake. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A cooking mistake — the details",
      "Bring a cooking mistake to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A cooking mistake — a different perspective",
      "Consider a cooking mistake from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "An unfamiliar food — the story",
      "Tell a real or imagined story about an unfamiliar food. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "An unfamiliar food — the details",
      "Bring an unfamiliar food to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "An unfamiliar food — a different perspective",
      "Consider an unfamiliar food from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A memorable teacher — the story",
      "Tell a real or imagined story about a memorable teacher. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A memorable teacher — the details",
      "Bring a memorable teacher to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A memorable teacher — a different perspective",
      "Consider a memorable teacher from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A first day — the story",
      "Tell a real or imagined story about a first day. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A first day — the details",
      "Bring a first day to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A first day — a different perspective",
      "Consider a first day from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A last day — the story",
      "Tell a real or imagined story about a last day. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A last day — the details",
      "Bring a last day to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A last day — a different perspective",
      "Consider a last day from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "An awkward introduction — the story",
      "Tell a real or imagined story about an awkward introduction. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "An awkward introduction — the details",
      "Bring an awkward introduction to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "An awkward introduction — a different perspective",
      "Consider an awkward introduction from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A team project — the story",
      "Tell a real or imagined story about a team project. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A team project — the details",
      "Bring a team project to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A team project — a different perspective",
      "Consider a team project from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A friendly competition — the story",
      "Tell a real or imagined story about a friendly competition. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A friendly competition — the details",
      "Bring a friendly competition to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A friendly competition — a different perspective",
      "Consider a friendly competition from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A difficult apology — the story",
      "Tell a real or imagined story about a difficult apology. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A difficult apology — the details",
      "Bring a difficult apology to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A difficult apology — a different perspective",
      "Consider a difficult apology from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A misunderstanding — the story",
      "Tell a real or imagined story about a misunderstanding. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A misunderstanding — the details",
      "Bring a misunderstanding to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A misunderstanding — a different perspective",
      "Consider a misunderstanding from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A promise you kept — the story",
      "Tell a real or imagined story about a promise you kept. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A promise you kept — the details",
      "Bring a promise you kept to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A promise you kept — a different perspective",
      "Consider a promise you kept from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A promise you broke — the story",
      "Tell a real or imagined story about a promise you broke. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A promise you broke — the details",
      "Bring a promise you broke to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A promise you broke — a different perspective",
      "Consider a promise you broke from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A change of plans — the story",
      "Tell a real or imagined story about a change of plans. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A change of plans — the details",
      "Bring a change of plans to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A change of plans — a different perspective",
      "Consider a change of plans from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A wrong turn — the story",
      "Tell a real or imagined story about a wrong turn. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A wrong turn — the details",
      "Bring a wrong turn to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A wrong turn — a different perspective",
      "Consider a wrong turn from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A trip to the market — the story",
      "Tell a real or imagined story about a trip to the market. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A trip to the market — the details",
      "Bring a trip to the market to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A trip to the market — a different perspective",
      "Consider a trip to the market from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A museum visit — the story",
      "Tell a real or imagined story about a museum visit. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A museum visit — the details",
      "Bring a museum visit to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A museum visit — a different perspective",
      "Consider a museum visit from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A train journey — the story",
      "Tell a real or imagined story about a train journey. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A train journey — the details",
      "Bring a train journey to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A train journey — a different perspective",
      "Consider a train journey from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A bus ride — the story",
      "Tell a real or imagined story about a bus ride. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A bus ride — the details",
      "Bring a bus ride to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A bus ride — a different perspective",
      "Consider a bus ride from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A bike ride — the story",
      "Tell a real or imagined story about a bike ride. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A bike ride — the details",
      "Bring a bike ride to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A bike ride — a different perspective",
      "Consider a bike ride from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A long flight — the story",
      "Tell a real or imagined story about a long flight. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A long flight — the details",
      "Bring a long flight to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A long flight — a different perspective",
      "Consider a long flight from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "An early morning — the story",
      "Tell a real or imagined story about an early morning. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "An early morning — the details",
      "Bring an early morning to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "An early morning — a different perspective",
      "Consider an early morning from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A late night — the story",
      "Tell a real or imagined story about a late night. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A late night — the details",
      "Bring a late night to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A late night — a different perspective",
      "Consider a late night from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A peaceful evening — the story",
      "Tell a real or imagined story about a peaceful evening. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A peaceful evening — the details",
      "Bring a peaceful evening to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A peaceful evening — a different perspective",
      "Consider a peaceful evening from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A busy kitchen — the story",
      "Tell a real or imagined story about a busy kitchen. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A busy kitchen — the details",
      "Bring a busy kitchen to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A busy kitchen — a different perspective",
      "Consider a busy kitchen from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A childhood bedroom — the story",
      "Tell a real or imagined story about a childhood bedroom. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A childhood bedroom — the details",
      "Bring a childhood bedroom to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A childhood bedroom — a different perspective",
      "Consider a childhood bedroom from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A favorite window view — the story",
      "Tell a real or imagined story about a favorite window view. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A favorite window view — the details",
      "Bring a favorite window view to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A favorite window view — a different perspective",
      "Consider a favorite window view from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A street performer — the story",
      "Tell a real or imagined story about a street performer. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A street performer — the details",
      "Bring a street performer to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A street performer — a different perspective",
      "Consider a street performer from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A local shop — the story",
      "Tell a real or imagined story about a local shop. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A local shop — the details",
      "Bring a local shop to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A local shop — a different perspective",
      "Consider a local shop from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "An empty playground — the story",
      "Tell a real or imagined story about an empty playground. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "An empty playground — the details",
      "Bring an empty playground to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "An empty playground — a different perspective",
      "Consider an empty playground from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A community garden — the story",
      "Tell a real or imagined story about a community garden. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A community garden — the details",
      "Bring a community garden to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A community garden — a different perspective",
      "Consider a community garden from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A pet's strange habit — the story",
      "Tell a real or imagined story about a pet's strange habit. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A pet's strange habit — the details",
      "Bring a pet's strange habit to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A pet's strange habit — a different perspective",
      "Consider a pet's strange habit from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "An animal encounter — the story",
      "Tell a real or imagined story about an animal encounter. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "An animal encounter — the details",
      "Bring an animal encounter to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "An animal encounter — a different perspective",
      "Consider an animal encounter from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A plant you tried to grow — the story",
      "Tell a real or imagined story about a plant you tried to grow. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A plant you tried to grow — the details",
      "Bring a plant you tried to grow to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A plant you tried to grow — a different perspective",
      "Consider a plant you tried to grow from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A collection — the story",
      "Tell a real or imagined story about a collection. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A collection — the details",
      "Bring a collection to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A collection — a different perspective",
      "Consider a collection from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A favorite smell — the story",
      "Tell a real or imagined story about a favorite smell. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A favorite smell — the details",
      "Bring a favorite smell to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A favorite smell — a different perspective",
      "Consider a favorite smell from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A sound you remember — the story",
      "Tell a real or imagined story about a sound you remember. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A sound you remember — the details",
      "Bring a sound you remember to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A sound you remember — a different perspective",
      "Consider a sound you remember from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A song on repeat — the story",
      "Tell a real or imagined story about a song on repeat. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A song on repeat — the details",
      "Bring a song on repeat to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A song on repeat — a different perspective",
      "Consider a song on repeat from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A film that surprised you — the story",
      "Tell a real or imagined story about a film that surprised you. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A film that surprised you — the details",
      "Bring a film that surprised you to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A film that surprised you — a different perspective",
      "Consider a film that surprised you from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A book you abandoned — the story",
      "Tell a real or imagined story about a book you abandoned. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A book you abandoned — the details",
      "Bring a book you abandoned to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A book you abandoned — a different perspective",
      "Consider a book you abandoned from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A game you invented — the story",
      "Tell a real or imagined story about a game you invented. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A game you invented — the details",
      "Bring a game you invented to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A game you invented — a different perspective",
      "Consider a game you invented from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A hobby you tried — the story",
      "Tell a real or imagined story about a hobby you tried. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A hobby you tried — the details",
      "Bring a hobby you tried to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A hobby you tried — a different perspective",
      "Consider a hobby you tried from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A skill you taught someone — the story",
      "Tell a real or imagined story about a skill you taught someone. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A skill you taught someone — the details",
      "Bring a skill you taught someone to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A skill you taught someone — a different perspective",
      "Consider a skill you taught someone from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A skill someone taught you — the story",
      "Tell a real or imagined story about a skill someone taught you. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A skill someone taught you — the details",
      "Bring a skill someone taught you to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A skill someone taught you — a different perspective",
      "Consider a skill someone taught you from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A repair you attempted — the story",
      "Tell a real or imagined story about a repair you attempted. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A repair you attempted — the details",
      "Bring a repair you attempted to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A repair you attempted — a different perspective",
      "Consider a repair you attempted from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A room you rearranged — the story",
      "Tell a real or imagined story about a room you rearranged. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A room you rearranged — the details",
      "Bring a room you rearranged to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A room you rearranged — a different perspective",
      "Consider a room you rearranged from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A day without your phone — the story",
      "Tell a real or imagined story about a day without your phone. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A day without your phone — the details",
      "Bring a day without your phone to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A day without your phone — a different perspective",
      "Consider a day without your phone from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A conversation that stayed with you — the story",
      "Tell a real or imagined story about a conversation that stayed with you. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A conversation that stayed with you — the details",
      "Bring a conversation that stayed with you to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A conversation that stayed with you — a different perspective",
      "Consider a conversation that stayed with you from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A question you were afraid to ask — the story",
      "Tell a real or imagined story about a question you were afraid to ask. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A question you were afraid to ask — the details",
      "Bring a question you were afraid to ask to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A question you were afraid to ask — a different perspective",
      "Consider a question you were afraid to ask from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A compliment you remember — the story",
      "Tell a real or imagined story about a compliment you remember. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A compliment you remember — the details",
      "Bring a compliment you remember to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A compliment you remember — a different perspective",
      "Consider a compliment you remember from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A moment of patience — the story",
      "Tell a real or imagined story about a moment of patience. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A moment of patience — the details",
      "Bring a moment of patience to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A moment of patience — a different perspective",
      "Consider a moment of patience from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A moment of courage — the story",
      "Tell a real or imagined story about a moment of courage. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A moment of courage — the details",
      "Bring a moment of courage to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A moment of courage — a different perspective",
      "Consider a moment of courage from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A small victory — the story",
      "Tell a real or imagined story about a small victory. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A small victory — the details",
      "Bring a small victory to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A small victory — a different perspective",
      "Consider a small victory from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A goal you changed — the story",
      "Tell a real or imagined story about a goal you changed. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A goal you changed — the details",
      "Bring a goal you changed to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A goal you changed — a different perspective",
      "Consider a goal you changed from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A rule you questioned — the story",
      "Tell a real or imagined story about a rule you questioned. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A rule you questioned — the details",
      "Bring a rule you questioned to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A rule you questioned — a different perspective",
      "Consider a rule you questioned from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A habit you dropped — the story",
      "Tell a real or imagined story about a habit you dropped. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A habit you dropped — the details",
      "Bring a habit you dropped to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A habit you dropped — a different perspective",
      "Consider a habit you dropped from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A habit you started — the story",
      "Tell a real or imagined story about a habit you started. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A habit you started — the details",
      "Bring a habit you started to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A habit you started — a different perspective",
      "Consider a habit you started from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A joke that went wrong — the story",
      "Tell a real or imagined story about a joke that went wrong. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A joke that went wrong — the details",
      "Bring a joke that went wrong to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A joke that went wrong — a different perspective",
      "Consider a joke that went wrong from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A surprise reunion — the story",
      "Tell a real or imagined story about a surprise reunion. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A surprise reunion — the details",
      "Bring a surprise reunion to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A surprise reunion — a different perspective",
      "Consider a surprise reunion from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A farewell — the story",
      "Tell a real or imagined story about a farewell. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A farewell — the details",
      "Bring a farewell to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A farewell — a different perspective",
      "Consider a farewell from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A festival — the story",
      "Tell a real or imagined story about a festival. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A festival — the details",
      "Bring a festival to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A festival — a different perspective",
      "Consider a festival from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A birthday tradition — the story",
      "Tell a real or imagined story about a birthday tradition. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A birthday tradition — the details",
      "Bring a birthday tradition to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A birthday tradition — a different perspective",
      "Consider a birthday tradition from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "An ordinary Tuesday — the story",
      "Tell a real or imagined story about an ordinary tuesday. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "An ordinary Tuesday — the details",
      "Bring an ordinary tuesday to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "An ordinary Tuesday — a different perspective",
      "Consider an ordinary tuesday from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A weekend chore — the story",
      "Tell a real or imagined story about a weekend chore. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A weekend chore — the details",
      "Bring a weekend chore to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A weekend chore — a different perspective",
      "Consider a weekend chore from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A favorite shortcut — the story",
      "Tell a real or imagined story about a favorite shortcut. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A favorite shortcut — the details",
      "Bring a favorite shortcut to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A favorite shortcut — a different perspective",
      "Consider a favorite shortcut from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A place to think — the story",
      "Tell a real or imagined story about a place to think. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A place to think — the details",
      "Bring a place to think to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A place to think — a different perspective",
      "Consider a place to think from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A thing you keep for sentimental reasons — the story",
      "Tell a real or imagined story about a thing you keep for sentimental reasons. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A thing you keep for sentimental reasons — the details",
      "Bring a thing you keep for sentimental reasons to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A thing you keep for sentimental reasons — a different perspective",
      "Consider a thing you keep for sentimental reasons from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A plan that worked — the story",
      "Tell a real or imagined story about a plan that worked. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A plan that worked — the details",
      "Bring a plan that worked to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A plan that worked — a different perspective",
      "Consider a plan that worked from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A plan that failed — the story",
      "Tell a real or imagined story about a plan that failed. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A plan that failed — the details",
      "Bring a plan that failed to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A plan that failed — a different perspective",
      "Consider a plan that failed from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A meal shared with friends — the story",
      "Tell a real or imagined story about a meal shared with friends. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A meal shared with friends — the details",
      "Bring a meal shared with friends to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A meal shared with friends — a different perspective",
      "Consider a meal shared with friends from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ],
    [
      "A time you changed your mind — the story",
      "Tell a real or imagined story about a time you changed your mind. Set the scene, describe what happened, and end with what stayed with you."
    ],
    [
      "A time you changed your mind — the details",
      "Bring a time you changed your mind to life through three specific details. Explain why this ordinary experience could matter to someone."
    ],
    [
      "A time you changed your mind — a different perspective",
      "Consider a time you changed your mind from another person’s point of view. Explain how their experience could differ from yours, using a concrete example."
    ]
  ],
  "discovery": [
    [
      "Why soap cleans — explain it",
      "Research: why soap cleans. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "surfactants soap cleaning"
    ],
    [
      "Why soap cleans — the evidence",
      "Research: why soap cleans. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "surfactants soap cleaning"
    ],
    [
      "Why soap cleans — put it to use",
      "Research: why soap cleans. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "surfactants soap cleaning"
    ],
    [
      "How bread rises — explain it",
      "Research: how bread rises. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "yeast bread fermentation"
    ],
    [
      "How bread rises — the evidence",
      "Research: how bread rises. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "yeast bread fermentation"
    ],
    [
      "How bread rises — put it to use",
      "Research: how bread rises. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "yeast bread fermentation"
    ],
    [
      "Why onions make us cry — explain it",
      "Research: why onions make us cry. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "onion lachrymatory factor"
    ],
    [
      "Why onions make us cry — the evidence",
      "Research: why onions make us cry. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "onion lachrymatory factor"
    ],
    [
      "Why onions make us cry — put it to use",
      "Research: why onions make us cry. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "onion lachrymatory factor"
    ],
    [
      "How popcorn pops — explain it",
      "Research: how popcorn pops. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "popcorn popping physics"
    ],
    [
      "How popcorn pops — the evidence",
      "Research: how popcorn pops. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "popcorn popping physics"
    ],
    [
      "How popcorn pops — put it to use",
      "Research: how popcorn pops. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "popcorn popping physics"
    ],
    [
      "Why ice floats — explain it",
      "Research: why ice floats. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "water ice density hydrogen bonding"
    ],
    [
      "Why ice floats — the evidence",
      "Research: why ice floats. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "water ice density hydrogen bonding"
    ],
    [
      "Why ice floats — put it to use",
      "Research: why ice floats. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "water ice density hydrogen bonding"
    ],
    [
      "How refrigerators work — explain it",
      "Research: how refrigerators work. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "refrigeration heat pump cycle"
    ],
    [
      "How refrigerators work — the evidence",
      "Research: how refrigerators work. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "refrigeration heat pump cycle"
    ],
    [
      "How refrigerators work — put it to use",
      "Research: how refrigerators work. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "refrigeration heat pump cycle"
    ],
    [
      "Why metal feels cold — explain it",
      "Research: why metal feels cold. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "thermal effusivity touch"
    ],
    [
      "Why metal feels cold — the evidence",
      "Research: why metal feels cold. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "thermal effusivity touch"
    ],
    [
      "Why metal feels cold — put it to use",
      "Research: why metal feels cold. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "thermal effusivity touch"
    ],
    [
      "How pressure cookers work — explain it",
      "Research: how pressure cookers work. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "pressure cooker boiling point"
    ],
    [
      "How pressure cookers work — the evidence",
      "Research: how pressure cookers work. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "pressure cooker boiling point"
    ],
    [
      "How pressure cookers work — put it to use",
      "Research: how pressure cookers work. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "pressure cooker boiling point"
    ],
    [
      "Why cut apples turn brown — explain it",
      "Research: why cut apples turn brown. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "enzymatic browning apples"
    ],
    [
      "Why cut apples turn brown — the evidence",
      "Research: why cut apples turn brown. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "enzymatic browning apples"
    ],
    [
      "Why cut apples turn brown — put it to use",
      "Research: why cut apples turn brown. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "enzymatic browning apples"
    ],
    [
      "How induction stoves heat pans — explain it",
      "Research: how induction stoves heat pans. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "electromagnetic induction cooking"
    ],
    [
      "How induction stoves heat pans — the evidence",
      "Research: how induction stoves heat pans. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "electromagnetic induction cooking"
    ],
    [
      "How induction stoves heat pans — put it to use",
      "Research: how induction stoves heat pans. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "electromagnetic induction cooking"
    ],
    [
      "How sourdough works — explain it",
      "Research: how sourdough works. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "sourdough microbial fermentation"
    ],
    [
      "How sourdough works — the evidence",
      "Research: how sourdough works. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "sourdough microbial fermentation"
    ],
    [
      "How sourdough works — put it to use",
      "Research: how sourdough works. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "sourdough microbial fermentation"
    ],
    [
      "Why salt melts road ice — explain it",
      "Research: why salt melts road ice. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "freezing point depression road salt"
    ],
    [
      "Why salt melts road ice — the evidence",
      "Research: why salt melts road ice. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "freezing point depression road salt"
    ],
    [
      "Why salt melts road ice — put it to use",
      "Research: why salt melts road ice. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "freezing point depression road salt"
    ],
    [
      "How sunscreen works — explain it",
      "Research: how sunscreen works. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "sunscreen ultraviolet absorption"
    ],
    [
      "How sunscreen works — the evidence",
      "Research: how sunscreen works. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "sunscreen ultraviolet absorption"
    ],
    [
      "How sunscreen works — put it to use",
      "Research: how sunscreen works. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "sunscreen ultraviolet absorption"
    ],
    [
      "How noise cancellation works — explain it",
      "Research: how noise cancellation works. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "active noise cancellation"
    ],
    [
      "How noise cancellation works — the evidence",
      "Research: how noise cancellation works. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "active noise cancellation"
    ],
    [
      "How noise cancellation works — put it to use",
      "Research: how noise cancellation works. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "active noise cancellation"
    ],
    [
      "How touchscreens detect fingers — explain it",
      "Research: how touchscreens detect fingers. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "capacitive touchscreen sensing"
    ],
    [
      "How touchscreens detect fingers — the evidence",
      "Research: how touchscreens detect fingers. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "capacitive touchscreen sensing"
    ],
    [
      "How touchscreens detect fingers — put it to use",
      "Research: how touchscreens detect fingers. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "capacitive touchscreen sensing"
    ],
    [
      "How GPS finds a location — explain it",
      "Research: how gps finds a location. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "GPS trilateration atomic clocks"
    ],
    [
      "How GPS finds a location — the evidence",
      "Research: how gps finds a location. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "GPS trilateration atomic clocks"
    ],
    [
      "How GPS finds a location — put it to use",
      "Research: how gps finds a location. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "GPS trilateration atomic clocks"
    ],
    [
      "How QR codes store information — explain it",
      "Research: how qr codes store information. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "QR code error correction"
    ],
    [
      "How QR codes store information — the evidence",
      "Research: how qr codes store information. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "QR code error correction"
    ],
    [
      "How QR codes store information — put it to use",
      "Research: how qr codes store information. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "QR code error correction"
    ],
    [
      "How error-correcting codes work — explain it",
      "Research: how error-correcting codes work. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "error correcting codes information theory"
    ],
    [
      "How error-correcting codes work — the evidence",
      "Research: how error-correcting codes work. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "error correcting codes information theory"
    ],
    [
      "How error-correcting codes work — put it to use",
      "Research: how error-correcting codes work. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "error correcting codes information theory"
    ],
    [
      "How compression shrinks files — explain it",
      "Research: how compression shrinks files. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "lossless lossy data compression"
    ],
    [
      "How compression shrinks files — the evidence",
      "Research: how compression shrinks files. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "lossless lossy data compression"
    ],
    [
      "How compression shrinks files — put it to use",
      "Research: how compression shrinks files. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "lossless lossy data compression"
    ],
    [
      "How a digital camera captures light — explain it",
      "Research: how a digital camera captures light. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "CMOS image sensor photodiodes"
    ],
    [
      "How a digital camera captures light — the evidence",
      "Research: how a digital camera captures light. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "CMOS image sensor photodiodes"
    ],
    [
      "How a digital camera captures light — put it to use",
      "Research: how a digital camera captures light. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "CMOS image sensor photodiodes"
    ],
    [
      "How fiber optics carry information — explain it",
      "Research: how fiber optics carry information. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "fiber optics total internal reflection"
    ],
    [
      "How fiber optics carry information — the evidence",
      "Research: how fiber optics carry information. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "fiber optics total internal reflection"
    ],
    [
      "How fiber optics carry information — put it to use",
      "Research: how fiber optics carry information. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "fiber optics total internal reflection"
    ],
    [
      "How solar panels generate electricity — explain it",
      "Research: how solar panels generate electricity. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "photovoltaic effect solar cells"
    ],
    [
      "How solar panels generate electricity — the evidence",
      "Research: how solar panels generate electricity. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "photovoltaic effect solar cells"
    ],
    [
      "How solar panels generate electricity — put it to use",
      "Research: how solar panels generate electricity. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "photovoltaic effect solar cells"
    ],
    [
      "How batteries store energy — explain it",
      "Research: how batteries store energy. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "electrochemical battery energy storage"
    ],
    [
      "How batteries store energy — the evidence",
      "Research: how batteries store energy. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "electrochemical battery energy storage"
    ],
    [
      "How batteries store energy — put it to use",
      "Research: how batteries store energy. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "electrochemical battery energy storage"
    ],
    [
      "How wireless charging works — explain it",
      "Research: how wireless charging works. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "inductive wireless power transfer"
    ],
    [
      "How wireless charging works — the evidence",
      "Research: how wireless charging works. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "inductive wireless power transfer"
    ],
    [
      "How wireless charging works — put it to use",
      "Research: how wireless charging works. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "inductive wireless power transfer"
    ],
    [
      "How wind turbines generate power — explain it",
      "Research: how wind turbines generate power. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "wind turbine energy conversion"
    ],
    [
      "How wind turbines generate power — the evidence",
      "Research: how wind turbines generate power. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "wind turbine energy conversion"
    ],
    [
      "How wind turbines generate power — put it to use",
      "Research: how wind turbines generate power. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "wind turbine energy conversion"
    ],
    [
      "How a compass works — explain it",
      "Research: how a compass works. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "magnetic compass geomagnetic field"
    ],
    [
      "How a compass works — the evidence",
      "Research: how a compass works. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "magnetic compass geomagnetic field"
    ],
    [
      "How a compass works — put it to use",
      "Research: how a compass works. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "magnetic compass geomagnetic field"
    ],
    [
      "How a bicycle stays upright — explain it",
      "Research: how a bicycle stays upright. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "bicycle stability dynamics"
    ],
    [
      "How a bicycle stays upright — the evidence",
      "Research: how a bicycle stays upright. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "bicycle stability dynamics"
    ],
    [
      "How a bicycle stays upright — put it to use",
      "Research: how a bicycle stays upright. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "bicycle stability dynamics"
    ],
    [
      "How airplane wings produce lift — explain it",
      "Research: how airplane wings produce lift. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "aerodynamic lift wings"
    ],
    [
      "How airplane wings produce lift — the evidence",
      "Research: how airplane wings produce lift. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "aerodynamic lift wings"
    ],
    [
      "How airplane wings produce lift — put it to use",
      "Research: how airplane wings produce lift. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "aerodynamic lift wings"
    ],
    [
      "Why bridges expand in heat — explain it",
      "Research: why bridges expand in heat. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "thermal expansion bridge joints"
    ],
    [
      "Why bridges expand in heat — the evidence",
      "Research: why bridges expand in heat. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "thermal expansion bridge joints"
    ],
    [
      "Why bridges expand in heat — put it to use",
      "Research: why bridges expand in heat. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "thermal expansion bridge joints"
    ],
    [
      "How earthquake-resistant buildings work — explain it",
      "Research: how earthquake-resistant buildings work. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "seismic isolation building design"
    ],
    [
      "How earthquake-resistant buildings work — the evidence",
      "Research: how earthquake-resistant buildings work. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "seismic isolation building design"
    ],
    [
      "How earthquake-resistant buildings work — put it to use",
      "Research: how earthquake-resistant buildings work. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "seismic isolation building design"
    ],
    [
      "How water towers work — explain it",
      "Research: how water towers work. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "water tower hydrostatic pressure"
    ],
    [
      "How water towers work — the evidence",
      "Research: how water towers work. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "water tower hydrostatic pressure"
    ],
    [
      "How water towers work — put it to use",
      "Research: how water towers work. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "water tower hydrostatic pressure"
    ],
    [
      "How wastewater is treated — explain it",
      "Research: how wastewater is treated. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "wastewater biological treatment"
    ],
    [
      "How wastewater is treated — the evidence",
      "Research: how wastewater is treated. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "wastewater biological treatment"
    ],
    [
      "How wastewater is treated — put it to use",
      "Research: how wastewater is treated. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "wastewater biological treatment"
    ],
    [
      "How desalination works — explain it",
      "Research: how desalination works. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "reverse osmosis desalination"
    ],
    [
      "How desalination works — the evidence",
      "Research: how desalination works. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "reverse osmosis desalination"
    ],
    [
      "How desalination works — put it to use",
      "Research: how desalination works. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "reverse osmosis desalination"
    ],
    [
      "How weather forecasts are made — explain it",
      "Research: how weather forecasts are made. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "numerical weather prediction uncertainty"
    ],
    [
      "How weather forecasts are made — the evidence",
      "Research: how weather forecasts are made. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "numerical weather prediction uncertainty"
    ],
    [
      "How weather forecasts are made — put it to use",
      "Research: how weather forecasts are made. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "numerical weather prediction uncertainty"
    ],
    [
      "How clouds form — explain it",
      "Research: how clouds form. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "cloud condensation nuclei"
    ],
    [
      "How clouds form — the evidence",
      "Research: how clouds form. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "cloud condensation nuclei"
    ],
    [
      "How clouds form — put it to use",
      "Research: how clouds form. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "cloud condensation nuclei"
    ],
    [
      "Why rainbows form — explain it",
      "Research: why rainbows form. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "rainbow refraction dispersion"
    ],
    [
      "Why rainbows form — the evidence",
      "Research: why rainbows form. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "rainbow refraction dispersion"
    ],
    [
      "Why rainbows form — put it to use",
      "Research: why rainbows form. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "rainbow refraction dispersion"
    ],
    [
      "How lightning forms — explain it",
      "Research: how lightning forms. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "thunderstorm charge separation lightning"
    ],
    [
      "How lightning forms — the evidence",
      "Research: how lightning forms. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "thunderstorm charge separation lightning"
    ],
    [
      "How lightning forms — put it to use",
      "Research: how lightning forms. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "thunderstorm charge separation lightning"
    ],
    [
      "How tornadoes form — explain it",
      "Research: how tornadoes form. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "tornado formation supercell"
    ],
    [
      "How tornadoes form — the evidence",
      "Research: how tornadoes form. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "tornado formation supercell"
    ],
    [
      "How tornadoes form — put it to use",
      "Research: how tornadoes form. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "tornado formation supercell"
    ],
    [
      "How ocean tides work — explain it",
      "Research: how ocean tides work. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "ocean tides gravity"
    ],
    [
      "How ocean tides work — the evidence",
      "Research: how ocean tides work. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "ocean tides gravity"
    ],
    [
      "How ocean tides work — put it to use",
      "Research: how ocean tides work. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "ocean tides gravity"
    ],
    [
      "How ocean currents move heat — explain it",
      "Research: how ocean currents move heat. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "ocean circulation heat transport"
    ],
    [
      "How ocean currents move heat — the evidence",
      "Research: how ocean currents move heat. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "ocean circulation heat transport"
    ],
    [
      "How ocean currents move heat — put it to use",
      "Research: how ocean currents move heat. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "ocean circulation heat transport"
    ],
    [
      "How rivers shape landscapes — explain it",
      "Research: how rivers shape landscapes. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "fluvial erosion meanders"
    ],
    [
      "How rivers shape landscapes — the evidence",
      "Research: how rivers shape landscapes. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "fluvial erosion meanders"
    ],
    [
      "How rivers shape landscapes — put it to use",
      "Research: how rivers shape landscapes. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "fluvial erosion meanders"
    ],
    [
      "How sand dunes move — explain it",
      "Research: how sand dunes move. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "aeolian sand dune migration"
    ],
    [
      "How sand dunes move — the evidence",
      "Research: how sand dunes move. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "aeolian sand dune migration"
    ],
    [
      "How sand dunes move — put it to use",
      "Research: how sand dunes move. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "aeolian sand dune migration"
    ],
    [
      "How caves form — explain it",
      "Research: how caves form. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "limestone cave dissolution"
    ],
    [
      "How caves form — the evidence",
      "Research: how caves form. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "limestone cave dissolution"
    ],
    [
      "How caves form — put it to use",
      "Research: how caves form. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "limestone cave dissolution"
    ],
    [
      "How volcanoes erupt — explain it",
      "Research: how volcanoes erupt. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "volcanic eruption magma pressure"
    ],
    [
      "How volcanoes erupt — the evidence",
      "Research: how volcanoes erupt. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "volcanic eruption magma pressure"
    ],
    [
      "How volcanoes erupt — put it to use",
      "Research: how volcanoes erupt. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "volcanic eruption magma pressure"
    ],
    [
      "How fossils form — explain it",
      "Research: how fossils form. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "fossilization taphonomy"
    ],
    [
      "How fossils form — the evidence",
      "Research: how fossils form. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "fossilization taphonomy"
    ],
    [
      "How fossils form — put it to use",
      "Research: how fossils form. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "fossilization taphonomy"
    ],
    [
      "How scientists date ancient materials — explain it",
      "Research: how scientists date ancient materials. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "radiometric dating methods limitations"
    ],
    [
      "How scientists date ancient materials — the evidence",
      "Research: how scientists date ancient materials. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "radiometric dating methods limitations"
    ],
    [
      "How scientists date ancient materials — put it to use",
      "Research: how scientists date ancient materials. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "radiometric dating methods limitations"
    ],
    [
      "How tree rings record change — explain it",
      "Research: how tree rings record change. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "dendrochronology climate"
    ],
    [
      "How tree rings record change — the evidence",
      "Research: how tree rings record change. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "dendrochronology climate"
    ],
    [
      "How tree rings record change — put it to use",
      "Research: how tree rings record change. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "dendrochronology climate"
    ],
    [
      "How glaciers reshape land — explain it",
      "Research: how glaciers reshape land. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "glacial erosion landforms"
    ],
    [
      "How glaciers reshape land — the evidence",
      "Research: how glaciers reshape land. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "glacial erosion landforms"
    ],
    [
      "How glaciers reshape land — put it to use",
      "Research: how glaciers reshape land. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "glacial erosion landforms"
    ],
    [
      "How coral reefs grow — explain it",
      "Research: how coral reefs grow. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "coral reef symbiosis growth"
    ],
    [
      "How coral reefs grow — the evidence",
      "Research: how coral reefs grow. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "coral reef symbiosis growth"
    ],
    [
      "How coral reefs grow — put it to use",
      "Research: how coral reefs grow. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "coral reef symbiosis growth"
    ],
    [
      "How mangroves tolerate salt — explain it",
      "Research: how mangroves tolerate salt. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "mangrove salt tolerance"
    ],
    [
      "How mangroves tolerate salt — the evidence",
      "Research: how mangroves tolerate salt. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "mangrove salt tolerance"
    ],
    [
      "How mangroves tolerate salt — put it to use",
      "Research: how mangroves tolerate salt. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "mangrove salt tolerance"
    ],
    [
      "How mushrooms disperse spores — explain it",
      "Research: how mushrooms disperse spores. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "fungal spore dispersal"
    ],
    [
      "How mushrooms disperse spores — the evidence",
      "Research: how mushrooms disperse spores. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "fungal spore dispersal"
    ],
    [
      "How mushrooms disperse spores — put it to use",
      "Research: how mushrooms disperse spores. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "fungal spore dispersal"
    ],
    [
      "How plants respond to light — explain it",
      "Research: how plants respond to light. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "plant phototropism auxin"
    ],
    [
      "How plants respond to light — the evidence",
      "Research: how plants respond to light. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "plant phototropism auxin"
    ],
    [
      "How plants respond to light — put it to use",
      "Research: how plants respond to light. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "plant phototropism auxin"
    ],
    [
      "How seeds travel — explain it",
      "Research: how seeds travel. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "seed dispersal mechanisms"
    ],
    [
      "How seeds travel — the evidence",
      "Research: how seeds travel. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "seed dispersal mechanisms"
    ],
    [
      "How seeds travel — put it to use",
      "Research: how seeds travel. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "seed dispersal mechanisms"
    ],
    [
      "How roots find water — explain it",
      "Research: how roots find water. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "root hydrotropism"
    ],
    [
      "How roots find water — the evidence",
      "Research: how roots find water. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "root hydrotropism"
    ],
    [
      "How roots find water — put it to use",
      "Research: how roots find water. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "root hydrotropism"
    ],
    [
      "How carnivorous plants obtain nutrients — explain it",
      "Research: how carnivorous plants obtain nutrients. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "carnivorous plant nutrient acquisition"
    ],
    [
      "How carnivorous plants obtain nutrients — the evidence",
      "Research: how carnivorous plants obtain nutrients. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "carnivorous plant nutrient acquisition"
    ],
    [
      "How carnivorous plants obtain nutrients — put it to use",
      "Research: how carnivorous plants obtain nutrients. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "carnivorous plant nutrient acquisition"
    ],
    [
      "How cacti conserve water — explain it",
      "Research: how cacti conserve water. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "cactus CAM photosynthesis"
    ],
    [
      "How cacti conserve water — the evidence",
      "Research: how cacti conserve water. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "cactus CAM photosynthesis"
    ],
    [
      "How cacti conserve water — put it to use",
      "Research: how cacti conserve water. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "cactus CAM photosynthesis"
    ],
    [
      "How bees navigate — explain it",
      "Research: how bees navigate. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "honeybee navigation waggle dance"
    ],
    [
      "How bees navigate — the evidence",
      "Research: how bees navigate. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "honeybee navigation waggle dance"
    ],
    [
      "How bees navigate — put it to use",
      "Research: how bees navigate. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "honeybee navigation waggle dance"
    ],
    [
      "How bats use sound — explain it",
      "Research: how bats use sound. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "bat echolocation"
    ],
    [
      "How bats use sound — the evidence",
      "Research: how bats use sound. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "bat echolocation"
    ],
    [
      "How bats use sound — put it to use",
      "Research: how bats use sound. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "bat echolocation"
    ],
    [
      "How birds navigate migration — explain it",
      "Research: how birds navigate migration. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "bird migration navigation evidence"
    ],
    [
      "How birds navigate migration — the evidence",
      "Research: how birds navigate migration. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "bird migration navigation evidence"
    ],
    [
      "How birds navigate migration — put it to use",
      "Research: how birds navigate migration. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "bird migration navigation evidence"
    ],
    [
      "How octopuses camouflage — explain it",
      "Research: how octopuses camouflage. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "octopus camouflage chromatophores"
    ],
    [
      "How octopuses camouflage — the evidence",
      "Research: how octopuses camouflage. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "octopus camouflage chromatophores"
    ],
    [
      "How octopuses camouflage — put it to use",
      "Research: how octopuses camouflage. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "octopus camouflage chromatophores"
    ],
    [
      "How geckos climb walls — explain it",
      "Research: how geckos climb walls. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "gecko adhesion setae"
    ],
    [
      "How geckos climb walls — the evidence",
      "Research: how geckos climb walls. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "gecko adhesion setae"
    ],
    [
      "How geckos climb walls — put it to use",
      "Research: how geckos climb walls. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "gecko adhesion setae"
    ],
    [
      "How spiders produce silk — explain it",
      "Research: how spiders produce silk. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "spider silk protein structure"
    ],
    [
      "How spiders produce silk — the evidence",
      "Research: how spiders produce silk. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "spider silk protein structure"
    ],
    [
      "How spiders produce silk — put it to use",
      "Research: how spiders produce silk. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "spider silk protein structure"
    ],
    [
      "How fish control buoyancy — explain it",
      "Research: how fish control buoyancy. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "fish swim bladder buoyancy"
    ],
    [
      "How fish control buoyancy — the evidence",
      "Research: how fish control buoyancy. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "fish swim bladder buoyancy"
    ],
    [
      "How fish control buoyancy — put it to use",
      "Research: how fish control buoyancy. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "fish swim bladder buoyancy"
    ],
    [
      "How penguins conserve heat — explain it",
      "Research: how penguins conserve heat. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "penguin thermoregulation"
    ],
    [
      "How penguins conserve heat — the evidence",
      "Research: how penguins conserve heat. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "penguin thermoregulation"
    ],
    [
      "How penguins conserve heat — put it to use",
      "Research: how penguins conserve heat. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "penguin thermoregulation"
    ],
    [
      "How whales communicate — explain it",
      "Research: how whales communicate. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "whale acoustic communication"
    ],
    [
      "How whales communicate — the evidence",
      "Research: how whales communicate. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "whale acoustic communication"
    ],
    [
      "How whales communicate — put it to use",
      "Research: how whales communicate. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "whale acoustic communication"
    ],
    [
      "How snakes sense heat — explain it",
      "Research: how snakes sense heat. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "snake infrared sensing"
    ],
    [
      "How snakes sense heat — the evidence",
      "Research: how snakes sense heat. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "snake infrared sensing"
    ],
    [
      "How snakes sense heat — put it to use",
      "Research: how snakes sense heat. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "snake infrared sensing"
    ],
    [
      "How fireflies produce light — explain it",
      "Research: how fireflies produce light. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "firefly bioluminescence"
    ],
    [
      "How fireflies produce light — the evidence",
      "Research: how fireflies produce light. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "firefly bioluminescence"
    ],
    [
      "How fireflies produce light — put it to use",
      "Research: how fireflies produce light. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "firefly bioluminescence"
    ],
    [
      "How electric eels generate voltage — explain it",
      "Research: how electric eels generate voltage. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "electric eel electrocytes"
    ],
    [
      "How electric eels generate voltage — the evidence",
      "Research: how electric eels generate voltage. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "electric eel electrocytes"
    ],
    [
      "How electric eels generate voltage — put it to use",
      "Research: how electric eels generate voltage. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "electric eel electrocytes"
    ],
    [
      "How beavers change rivers — explain it",
      "Research: how beavers change rivers. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "beaver dams ecosystem hydrology"
    ],
    [
      "How beavers change rivers — the evidence",
      "Research: how beavers change rivers. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "beaver dams ecosystem hydrology"
    ],
    [
      "How beavers change rivers — put it to use",
      "Research: how beavers change rivers. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "beaver dams ecosystem hydrology"
    ],
    [
      "How wolves affect ecosystems — explain it",
      "Research: how wolves affect ecosystems. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "wolf trophic cascades evidence"
    ],
    [
      "How wolves affect ecosystems — the evidence",
      "Research: how wolves affect ecosystems. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "wolf trophic cascades evidence"
    ],
    [
      "How wolves affect ecosystems — put it to use",
      "Research: how wolves affect ecosystems. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "wolf trophic cascades evidence"
    ],
    [
      "How antibiotics affect bacteria — explain it",
      "Research: how antibiotics affect bacteria. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "antibiotic mechanisms bacterial resistance"
    ],
    [
      "How antibiotics affect bacteria — the evidence",
      "Research: how antibiotics affect bacteria. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "antibiotic mechanisms bacterial resistance"
    ],
    [
      "How antibiotics affect bacteria — put it to use",
      "Research: how antibiotics affect bacteria. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "antibiotic mechanisms bacterial resistance"
    ],
    [
      "How vaccines train immune responses — explain it",
      "Research: how vaccines train immune responses. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "vaccine adaptive immunity"
    ],
    [
      "How vaccines train immune responses — the evidence",
      "Research: how vaccines train immune responses. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "vaccine adaptive immunity"
    ],
    [
      "How vaccines train immune responses — put it to use",
      "Research: how vaccines train immune responses. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "vaccine adaptive immunity"
    ],
    [
      "How wounds heal — explain it",
      "Research: how wounds heal. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "wound healing phases"
    ],
    [
      "How wounds heal — the evidence",
      "Research: how wounds heal. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "wound healing phases"
    ],
    [
      "How wounds heal — put it to use",
      "Research: how wounds heal. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "wound healing phases"
    ],
    [
      "How bones repair themselves — explain it",
      "Research: how bones repair themselves. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "bone fracture healing"
    ],
    [
      "How bones repair themselves — the evidence",
      "Research: how bones repair themselves. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "bone fracture healing"
    ],
    [
      "How bones repair themselves — put it to use",
      "Research: how bones repair themselves. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "bone fracture healing"
    ],
    [
      "How muscles adapt to exercise — explain it",
      "Research: how muscles adapt to exercise. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "skeletal muscle adaptation"
    ],
    [
      "How muscles adapt to exercise — the evidence",
      "Research: how muscles adapt to exercise. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "skeletal muscle adaptation"
    ],
    [
      "How muscles adapt to exercise — put it to use",
      "Research: how muscles adapt to exercise. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "skeletal muscle adaptation"
    ],
    [
      "How the eye focuses — explain it",
      "Research: how the eye focuses. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "eye accommodation lens"
    ],
    [
      "How the eye focuses — the evidence",
      "Research: how the eye focuses. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "eye accommodation lens"
    ],
    [
      "How the eye focuses — put it to use",
      "Research: how the eye focuses. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "eye accommodation lens"
    ],
    [
      "How the ear detects sound — explain it",
      "Research: how the ear detects sound. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "cochlea hearing hair cells"
    ],
    [
      "How the ear detects sound — the evidence",
      "Research: how the ear detects sound. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "cochlea hearing hair cells"
    ],
    [
      "How the ear detects sound — put it to use",
      "Research: how the ear detects sound. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "cochlea hearing hair cells"
    ],
    [
      "How balance works — explain it",
      "Research: how balance works. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "vestibular system balance"
    ],
    [
      "How balance works — the evidence",
      "Research: how balance works. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "vestibular system balance"
    ],
    [
      "How balance works — put it to use",
      "Research: how balance works. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "vestibular system balance"
    ],
    [
      "How smell and taste interact — explain it",
      "Research: how smell and taste interact. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "olfaction taste flavor perception"
    ],
    [
      "How smell and taste interact — the evidence",
      "Research: how smell and taste interact. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "olfaction taste flavor perception"
    ],
    [
      "How smell and taste interact — put it to use",
      "Research: how smell and taste interact. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "olfaction taste flavor perception"
    ],
    [
      "How the body regulates temperature — explain it",
      "Research: how the body regulates temperature. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "human thermoregulation"
    ],
    [
      "How the body regulates temperature — the evidence",
      "Research: how the body regulates temperature. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "human thermoregulation"
    ],
    [
      "How the body regulates temperature — put it to use",
      "Research: how the body regulates temperature. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "human thermoregulation"
    ],
    [
      "Why optical illusions work — explain it",
      "Research: why optical illusions work. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "visual illusion perception"
    ],
    [
      "Why optical illusions work — the evidence",
      "Research: why optical illusions work. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "visual illusion perception"
    ],
    [
      "Why optical illusions work — put it to use",
      "Research: why optical illusions work. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "visual illusion perception"
    ],
    [
      "How attention filters information — explain it",
      "Research: how attention filters information. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "selective attention cognitive psychology"
    ],
    [
      "How attention filters information — the evidence",
      "Research: how attention filters information. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "selective attention cognitive psychology"
    ],
    [
      "How attention filters information — put it to use",
      "Research: how attention filters information. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "selective attention cognitive psychology"
    ],
    [
      "How working memory works — explain it",
      "Research: how working memory works. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "working memory capacity evidence"
    ],
    [
      "How working memory works — the evidence",
      "Research: how working memory works. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "working memory capacity evidence"
    ],
    [
      "How working memory works — put it to use",
      "Research: how working memory works. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "working memory capacity evidence"
    ],
    [
      "How spaced practice affects learning — explain it",
      "Research: how spaced practice affects learning. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "spaced repetition learning evidence"
    ],
    [
      "How spaced practice affects learning — the evidence",
      "Research: how spaced practice affects learning. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "spaced repetition learning evidence"
    ],
    [
      "How spaced practice affects learning — put it to use",
      "Research: how spaced practice affects learning. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "spaced repetition learning evidence"
    ],
    [
      "How sleep relates to memory — explain it",
      "Research: how sleep relates to memory. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "sleep memory consolidation"
    ],
    [
      "How sleep relates to memory — the evidence",
      "Research: how sleep relates to memory. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "sleep memory consolidation"
    ],
    [
      "How sleep relates to memory — put it to use",
      "Research: how sleep relates to memory. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "sleep memory consolidation"
    ],
    [
      "How habits form — explain it",
      "Research: how habits form. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "habit formation behavioral research"
    ],
    [
      "How habits form — the evidence",
      "Research: how habits form. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "habit formation behavioral research"
    ],
    [
      "How habits form — put it to use",
      "Research: how habits form. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "habit formation behavioral research"
    ],
    [
      "How language sounds are learned — explain it",
      "Research: how language sounds are learned. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "infant phonetic learning"
    ],
    [
      "How language sounds are learned — the evidence",
      "Research: how language sounds are learned. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "infant phonetic learning"
    ],
    [
      "How language sounds are learned — put it to use",
      "Research: how language sounds are learned. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "infant phonetic learning"
    ],
    [
      "How music affects perceived emotion — explain it",
      "Research: how music affects perceived emotion. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "music emotion perception research"
    ],
    [
      "How music affects perceived emotion — the evidence",
      "Research: how music affects perceived emotion. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "music emotion perception research"
    ],
    [
      "How music affects perceived emotion — put it to use",
      "Research: how music affects perceived emotion. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "music emotion perception research"
    ],
    [
      "How crowds estimate quantities — explain it",
      "Research: how crowds estimate quantities. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "wisdom of crowds estimation limitations"
    ],
    [
      "How crowds estimate quantities — the evidence",
      "Research: how crowds estimate quantities. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "wisdom of crowds estimation limitations"
    ],
    [
      "How crowds estimate quantities — put it to use",
      "Research: how crowds estimate quantities. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "wisdom of crowds estimation limitations"
    ],
    [
      "How cooperation evolves — explain it",
      "Research: how cooperation evolves. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "evolution cooperation mechanisms"
    ],
    [
      "How cooperation evolves — the evidence",
      "Research: how cooperation evolves. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "evolution cooperation mechanisms"
    ],
    [
      "How cooperation evolves — put it to use",
      "Research: how cooperation evolves. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "evolution cooperation mechanisms"
    ],
    [
      "How exoplanets are detected — explain it",
      "Research: how exoplanets are detected. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "exoplanet transit radial velocity detection"
    ],
    [
      "How exoplanets are detected — the evidence",
      "Research: how exoplanets are detected. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "exoplanet transit radial velocity detection"
    ],
    [
      "How exoplanets are detected — put it to use",
      "Research: how exoplanets are detected. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "exoplanet transit radial velocity detection"
    ],
    [
      "How stars produce energy — explain it",
      "Research: how stars produce energy. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "stellar nuclear fusion"
    ],
    [
      "How stars produce energy — the evidence",
      "Research: how stars produce energy. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "stellar nuclear fusion"
    ],
    [
      "How stars produce energy — put it to use",
      "Research: how stars produce energy. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "stellar nuclear fusion"
    ],
    [
      "How telescopes collect light — explain it",
      "Research: how telescopes collect light. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "telescope aperture resolution"
    ],
    [
      "How telescopes collect light — the evidence",
      "Research: how telescopes collect light. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "telescope aperture resolution"
    ],
    [
      "How telescopes collect light — put it to use",
      "Research: how telescopes collect light. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "telescope aperture resolution"
    ],
    [
      "How astronauts experience weightlessness — explain it",
      "Research: how astronauts experience weightlessness. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "orbital free fall microgravity"
    ],
    [
      "How astronauts experience weightlessness — the evidence",
      "Research: how astronauts experience weightlessness. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "orbital free fall microgravity"
    ],
    [
      "How astronauts experience weightlessness — put it to use",
      "Research: how astronauts experience weightlessness. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "orbital free fall microgravity"
    ],
    [
      "How space probes change direction — explain it",
      "Research: how space probes change direction. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "spacecraft propulsion orbital maneuvers"
    ],
    [
      "How space probes change direction — the evidence",
      "Research: how space probes change direction. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "spacecraft propulsion orbital maneuvers"
    ],
    [
      "How space probes change direction — put it to use",
      "Research: how space probes change direction. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "spacecraft propulsion orbital maneuvers"
    ],
    [
      "How satellites stay in orbit — explain it",
      "Research: how satellites stay in orbit. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "satellite orbital mechanics"
    ],
    [
      "How satellites stay in orbit — the evidence",
      "Research: how satellites stay in orbit. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "satellite orbital mechanics"
    ],
    [
      "How satellites stay in orbit — put it to use",
      "Research: how satellites stay in orbit. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "satellite orbital mechanics"
    ],
    [
      "How solar eclipses happen — explain it",
      "Research: how solar eclipses happen. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "solar eclipse orbital geometry"
    ],
    [
      "How solar eclipses happen — the evidence",
      "Research: how solar eclipses happen. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "solar eclipse orbital geometry"
    ],
    [
      "How solar eclipses happen — put it to use",
      "Research: how solar eclipses happen. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "solar eclipse orbital geometry"
    ],
    [
      "How meteorites are identified — explain it",
      "Research: how meteorites are identified. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "meteorite identification scientific methods"
    ],
    [
      "How meteorites are identified — the evidence",
      "Research: how meteorites are identified. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "meteorite identification scientific methods"
    ],
    [
      "How meteorites are identified — put it to use",
      "Research: how meteorites are identified. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "meteorite identification scientific methods"
    ],
    [
      "How the Moon's surface changes — explain it",
      "Research: how the moon's surface changes. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "lunar surface impact weathering"
    ],
    [
      "How the Moon's surface changes — the evidence",
      "Research: how the moon's surface changes. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "lunar surface impact weathering"
    ],
    [
      "How the Moon's surface changes — put it to use",
      "Research: how the moon's surface changes. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "lunar surface impact weathering"
    ],
    [
      "How scientists measure cosmic distances — explain it",
      "Research: how scientists measure cosmic distances. Explain the main mechanism to someone new to the subject, using an everyday comparison.",
      "cosmic distance ladder uncertainty"
    ],
    [
      "How scientists measure cosmic distances — the evidence",
      "Research: how scientists measure cosmic distances. Describe one observation or experiment that supports the explanation, and one limit of that evidence.",
      "cosmic distance ladder uncertainty"
    ],
    [
      "How scientists measure cosmic distances — put it to use",
      "Research: how scientists measure cosmic distances. Connect what you learn to a real-world application or consequence. Explain one constraint or tradeoff.",
      "cosmic distance ladder uncertainty"
    ]
  ],
  "argument": [
    [
      "Should schools teach cooking?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should schools teach personal finance?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should students help design school rules?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should schools replace grades with written feedback?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should exams be open-book?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should group projects receive individual grades?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should students choose their own reading lists?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should attendance affect grades?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should schools allow retaking tests?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should school uniforms be optional?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should classes spend more time outdoors?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should every student learn basic first aid?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should schools teach debate?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should learning a second language be required?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should students evaluate their teachers?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should schools have longer breaks between classes?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should class sizes be smaller even if it costs more?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should practical projects replace some exams?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should school libraries stay open on weekends?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should schools offer more vocational courses?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should workplaces offer flexible hours?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should salaries be listed in job advertisements?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should job interviews include paid trial tasks?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should meetings have a default time limit?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should employers discourage work messages after hours?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should promotions reward teamwork more than individual results?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should workplaces allow pets?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should employees choose where they work?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should companies publish pay ranges internally?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should businesses experiment with shorter workdays?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should cities close some streets to cars?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should parking cost more in busy city centers?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should public libraries lend tools?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should cities provide more public benches?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should apartment buildings include shared gardens?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should public transport run all night?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should cities prioritize cycling over parking?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should new buildings include public art?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should neighborhoods have more shared spaces?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should cities limit outdoor advertising?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should museums be free to enter?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should governments fund local music venues?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should historic buildings always be preserved?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should vacant shops become community spaces?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should cities install more drinking fountains?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should public parks have designated quiet areas?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should cities prioritize shade over decorative landscaping?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should libraries eliminate late fees?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should neighborhoods vote on street redesigns?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should towns support local shops over large chains?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should products be easier to repair?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should companies limit unnecessary packaging?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should stores charge for disposable bags?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should restaurants offer smaller portions at lower prices?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should clothing brands offer repair services?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should reusable containers become standard for takeout?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should electronic devices have replaceable batteries?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should stores display product repairability scores?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should supermarkets discount imperfect produce?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should advertising to children be restricted?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should social platforms hide follower counts?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should apps default to fewer notifications?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should online reviews require verified purchases?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should people have a right to disconnect from technology?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should video games include built-in break reminders?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should AI-generated media be clearly labeled?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should recommendation algorithms be explained to users?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should children have device-free spaces?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should websites make cancellation as easy as signup?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should apps offer a chronological feed by default?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Is it better to specialize or explore many interests?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Is consistency more valuable than intensity?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Is it better to plan a trip or improvise?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Is boredom useful?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Is changing your mind a sign of strength?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Is it better to give practical gifts or meaningful gifts?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Is competition necessary for improvement?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Is a small circle of friends better than a large one?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Is listening more important than speaking?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Is curiosity more important than confidence?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should sports leagues prioritize participation over winning?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should professional sports use more video reviews?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should communities invest more in amateur sports?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should esports be included in school activities?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should everyone try a team sport?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should public events offer quiet zones?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Should concerts limit phone use?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Should film adaptations stay faithful to the original book?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Should art be judged separately from its creator?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Should audiences help choose museum exhibitions?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Would you invest more in ocean research or space research?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Would you choose more free time or more income?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Would you preserve an old tradition or start a new one?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Would you rather master one skill or be competent at ten?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Would you choose a predictable job or an uncertain adventure?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Would you prioritize speed or accuracy in a team project?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ],
    [
      "Would you rather lead a team or become its expert?",
      "Choose a position, give a specific example, and address the strongest objection."
    ],
    [
      "Would you choose a walkable city or a spacious rural home?",
      "Make your case by weighing who benefits, who might lose out, and one practical tradeoff."
    ],
    [
      "Would you spend a community grant on a garden or a playground?",
      "State your view, explain your main reason, and describe what evidence could change your mind."
    ],
    [
      "Would you prioritize convenience or durability when buying something?",
      "Defend your answer, fairly summarize the opposing view, and propose a workable compromise."
    ]
  ]
};

export const topics = Object.fromEntries(Object.entries(originalTopics).map(([category, rows]) => [category, [...rows, ...additions[category]]]));
