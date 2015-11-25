var width = 100, height = 100;
var $canvas = null, ctx = null, mp = null, minimap = null,
    $leaderboard = null;

var world = new AgarWorld();
var spec = null;

var offsetX = 0, offsetY = 0;

var skins = {
  'ℝ':1,
  '《ℝ》':1,
  '0chan':1,
  '18-25':1,
  '1up':1,
  '360nati0n':1,
  '8ball':1,
  'UmguwJ0':1,
  'aa9skillz':1,
  'ace':1,
  'adamzonetopmarks':1,
  'advertisingmz':1,
  'agar youtube':1,
  'agariomods.com':1,
  'al sahim':1,
  'alaska':1,
  'albania':1,
  'alchestbreach':1,
  'alexelcapo':1,
  'algeria':1,
  'am3nlc':1,
  'amoodiesqueezie':1,
  'amway921wot':1,
  'amyleethirty3':1,
  'anarchy':1,
  'android':1,
  'angrybirdsnest':1,
  'angryjoeshow':1,
  'animebromii':1,
  'anonymous':1,
  'antvenom':1,
  'aperture':1,
  'apple':1,
  'arcadego':1,
  'assassinscreed':1,
  'atari':1,
  'athenewins':1,
  'authenticgames':1,
  'avatar':1,
  'aviatorgaming':1,
  'awesome':1,
  'awwmuffin':1,
  'aypierre':1,
  'baka':1,
  'balenaproductions':1,
  'bandaid':1,
  'bane':1,
  'baseball':1,
  'bashurverse':1,
  'basketball':1,
  'bateson87':1,
  'batman':1,
  'battlefield':1,
  'bdoubleo100':1,
  'beats':1,
  'bebopvox':1,
  'belarus':1,
  'belgium':1,
  'bender':1,
  'benderchat':1,
  'bereghostgames':1,
  'bert':1,
  'bestcodcomedy':1,
  'bielarus':1,
  'bitcoin':1,
  'bjacau1':1,
  'bjacau2':1,
  'black widow':1,
  'blackiegonth':1,
  'blitzwinger':1,
  'blobfish':1,
  'bluexephos':1,
  'bluh':1,
  'blunty3000':1,
  'bobross':1,
  'bobsaget':1,
  'bodil30':1,
  'bodil40':1,
  'bohemianeagle':1,
  'boo':1,
  'boogie2988':1,
  'borg':1,
  'bowserbikejustdance':1,
  'bp':1,
  'breakfast':1,
  'breizh':1,
  'brksedu':1,
  'buckballs':1,
  'burgundy':1,
  'butters':1,
  'buzzbean11':1,
  'bystaxx':1,
  'byzantium':1,
  'calfreezy':1,
  'callofduty':1,
  'captainsparklez':1,
  'casaldenerd':1,
  'catalonia':1,
  'catalunya':1,
  'catman':1,
  'cavemanfilms':1,
  'celopand':1,
  'chaboyyhd':1,
  'chaika':1,
  'chaosxsilencer':1,
  'chaoticmonki':1,
  'charlie615119':1,
  'charmander':1,
  'chechenya':1,
  'checkpointplus':1,
  'cheese':1,
  'chickfila':1,
  'chimneyswift11':1,
  'chocolate':1,
  'chrisandthemike':1,
  'chrisarchieprods':1,
  'chrome':1,
  'chucknorris':1,
  'chuggaaconroy':1,
  'cicciogamer89':1,
  'cinnamontoastken':1,
  'cirno':1,
  'cj':1,
  'ckaikd0021':1,
  'clanlec':1,
  'clashofclansstrats':1,
  'cling on':1,
  'cobanermani456':1,
  'coca cola':1,
  'codqg':1,
  'coisadenerd':1,
  'cokacola':1,
  'colombia':1,
  'colombiaa':1,
  'commanderkrieger':1,
  'communitygame':1,
  'concrafter':1,
  'consolesejogosbrasil':1,
  'controless ':1,
  'converse':1,
  'cookie':1,
  'coolifegame':1,
  'coookie':1,
  'cornella':1,
  'cornella':1,
  'coruja':1,
  'craftbattleduty':1,
  'creeper':1,
  'creepydoll':1,
  'criken2':1,
  'criousgamers':1,
  'crispyconcords':1,
  'cristian4games':1,
  'csfb':1,
  'cuba':1,
  'cubex55':1,
  'cyberman65':1,
  'cypriengaming':1,
  'cyprus':1,
  'czech':1,
  'czechia':1,
  'czechrepublic':1,
  'd7297ut':1,
  'd7oomy999':1,
  'dagelijkshaadee':1,
  'daithidenogla':1,
  'darduinmymenlon':1,
  'darksideofmoon':1,
  'darksydephil':1,
  'darkzerotv':1,
  'dashiegames':1,
  'day9tv':1,
  'deadloxmc':1,
  'deadpool':1,
  'deal with it':1,
  'deathly hallows':1,
  'deathstar':1,
  'debitorlp':1,
  'deigamer':1,
  'demon':1,
  'derp':1,
  'desu':1,
  'dhole':1,
  'diabl0x9':1,
  'dickbutt':1,
  'dilleron':1,
  'dilleronplay':1,
  'direwolf20':1,
  'dissidiuswastaken':1,
  'dnb':1,
  'dnermc':1,
  'doge':1,
  'doggie':1,
  'dolan':1,
  'domo':1,
  'domokun':1,
  'donald':1,
  'dong':1,
  'donut':1,
  'doraemon':1,
  'dotacinema':1,
  'douglby':1,
  'dpjsc08':1,
  'dreamcast':1,
  'drift0r':1,
  'drunken':1,
  'dspgaming':1,
  'dusdavidgames':1,
  'dykgaming':1,
  'ea':1,
  'easports':1,
  'easportsfootball':1,
  'eatmydiction1':1,
  'eavision':1,
  'ebin':1,
  'eeoneguy':1,
  'egg':1,
  'egoraptor':1,
  'eguri89games':1,
  'egypt':1,
  'eksi':1,
  'electrokitty':1,
  'electronicartsde':1,
  'elementanimation':1,
  'elezwarface':1,
  'eligorko':1,
  'elrubiusomg':1,
  'enzoknol':1,
  'eowjdfudshrghk':1,
  'epicface':1,
  'ethoslab':1,
  'exetrizegamer':1,
  'expand':1,
  'eye':1,
  'facebook':1,
  'fantabobgames':1,
  'fast forward':1,
  'fastforward':1,
  'favijtv':1,
  'fazeclan':1,
  'fbi':1,
  'fer0m0nas':1,
  'fernanfloo':1,
  'fgteev':1,
  'fidel':1,
  'fiji':1,
  'finn':1,
  'fir4sgamer':1,
  'firefox':1,
  'fishies':1,
  'flash':1,
  'florida':1,
  'fnatic':1,
  'fnaticc':1,
  'foe':1,
  'folagor03':1,
  'forcesc2strategy':1,
  'forocoches':1,
  'frankieonpcin1080p':1,
  'freeman':1,
  'freemason':1,
  'friesland':1,
  'frigiel':1,
  'frogout':1,
  'fuckfacebook':1,
  'fullhdvideos4me':1,
  'funkyblackcat':1,
  'gaben':1,
  'gabenn':1,
  'gagatunfeed':1,
  'gamebombru':1,
  'gamefails':1,
  'gamegrumps':1,
  'gamehelper':1,
  'gameloft':1,
  'gamenewsofficial':1,
  'gameplayrj':1,
  'gamerspawn':1,
  'games':1,
  'gameshqmedia':1,
  'gamespot':1,
  'gamestarde':1,
  'gametrailers':1,
  'gametube':1,
  'gamexplain':1,
  'garenavietnam':1,
  'garfield':1,
  'gassymexican':1,
  'gaston':1,
  'geilkind':1,
  'generikb':1,
  'germanletsfail':1,
  'getinmybelly':1,
  'getinthebox':1,
  'ghostrobo':1,
  'giancarloparimango11':1,
  'gimper':1,
  'gimperr':1,
  'github':1,
  'giygas':1,
  'gizzy14gazza':1,
  'gnomechild':1,
  'gocalibergaming':1,
  'godsoncoc':1,
  'gogomantv':1,
  'gokoutv':1,
  'goldglovetv':1,
  'gommehd':1,
  'gona89':1,
  'gonzo':1,
  'gonzossm':1,
  'grammar nazi':1,
  'grayhat':1,
  'grima':1,
  'gronkh':1,
  'grumpy':1,
  'gtamissions':1,
  'gtaseriesvideos':1,
  'guccinoheya':1,
  'guilhermegamer':1,
  'guilhermeoss':1,
  'gurren lagann':1,
  'h2odelirious':1,
  'haatfilms':1,
  'hagrid':1,
  'halflife':1,
  'halflife3':1,
  'halo':1,
  'handicapped':1,
  'hap':1,
  'hassanalhajry':1,
  'hatty':1,
  'hawaii':1,
  'hawkeye':1,
  'hdluh':1,
  'hdstarcraft':1,
  'heartrockerchannel':1,
  'hebrew':1,
  'heisenburg':1,
  'helix':1,
  'helldogmadness':1,
  'hikakingames':1,
  'hikeplays':1,
  'hipsterwhale':1,
  'hispachan':1,
  'hitler':1,
  'homestuck':1,
  'honeycomb':1,
  'hosokawa':1,
  'hue':1,
  'huskymudkipz':1,
  'huskystarcraft':1,
  'hydro':1,
  'iballisticsquid':1,
  'iceland':1,
  'ie':1,
  'igameplay1337':1,
  'ignentertainment':1,
  'ihascupquake':1,
  'illuminati':1,
  'illuminatiii':1,
  'ilvostrocarodexter':1,
  'imaqtpie':1,
  'imgur':1,
  'immortalhdfilms':1,
  'imperial japan':1,
  'imperialists':1,
  'imperialjapan':1,
  'imvuinc':1,
  'insanegaz':1,
  'insidegaming':1,
  'insidersnetwork':1,
  'instagram':1,
  'instalok':1,
  'inthelittlewood':1,
  'ipodmail':1,
  'iron man':1,
  'isaac':1,
  'isamuxpompa':1,
  'isis':1,
  'isreal':1,
  'itchyfeetleech':1,
  'itsjerryandharry':1,
  'itsonbtv':1,
  'iulitm':1,
  'ivysaur':1,
  'izuniy':1,
  'jackfrags':1,
  'jacksepticeye':1,
  'jahovaswitniss':1,
  'jahrein':1,
  'jaidefinichon':1,
  'james bond':1,
  'jamesnintendonerd':1,
  'jamonymow':1,
  'java':1,
  'jellyyt':1,
  'jeromeasf':1,
  'jew':1,
  'jewnose':1,
  'jibanyan':1,
  'jimmies':1,
  'jjayjoker':1,
  'joeygraceffagames':1,
  'johnsju':1,
  'jontronshow':1,
  'josemicod5':1,
  'joueurdugrenier':1,
  'juegagerman':1,
  'jumpinthepack':1,
  'jupiter':1,
  'kalmar union':1,
  'kame':1,
  'kappa':1,
  'karamba728':1,
  'kenny':1,
  'keralis':1,
  'kiloomobile':1,
  'kingdomoffrance':1,
  'kingjoffrey':1,
  'kinnpatuhikaru':1,
  'kirby':1,
  'kitty':1,
  'kjragaming':1,
  'klingon':1,
  'knekrogamer':1,
  'knights templar':1,
  'knightstemplar':1,
  'knowyourmeme':1,
  'kootra':1,
  'kripparrian':1,
  'ksiolajidebt':1,
  'ksiolajidebthd':1,
  'kuplinovplay':1,
  'kurdistan':1,
  'kwebbelkop':1,
  'kyle':1,
  'kyokushin4':1,
  'kyrsp33dy':1,
  'ladle':1,
  'laggerfeed':1,
  'lazuritnyignom':1,
  'ldshadowlady':1,
  'le snake':1,
  'lenny':1,
  'letsplay':1,
  'letsplayshik':1,
  'letstaddl':1,
  'level5ch':1,
  'levelcapgaming':1,
  'lgbt':1,
  'liberland':1,
  'libertyy':1,
  'liechtenstien':1,
  'lifesimmer':1,
  'linux':1,
  'lisbug':1,
  'littlelizardgaming':1,
  'llessur':1,
  'loadingreadyrun':1,
  'loki':1,
  'lolchampseries':1,
  'lonniedos':1,
  'love':1,
  'lpmitkev':1,
  'luigi':1,
  'luke4316':1,
  'm3rkmus1c':1,
  'macedonia':1,
  'machinimarealm':1,
  'machinimarespawn':1,
  'magdalenamariamonika':1,
  'mahalovideogames':1,
  'malena010102':1,
  'malta':1,
  'mario':1,
  'mario11168':1,
  'markiplier':1,
  'markipliergame':1,
  'mars':1,
  'maryland':1,
  'masterball':1,
  'mastercheif':1,
  'mateiformiga':1,
  'matroix':1,
  'matthdgamer':1,
  'matthewpatrick13':1,
  'mattshea':1,
  'maxmoefoegames':1,
  'mcdonalds':1,
  'meatboy':1,
  'meatwad':1,
  'meatwagon22':1,
  'megamilk':1,
  'messyourself':1,
  'mickey':1,
  'mike tyson':1,
  'mike':1,
  'miles923':1,
  'minecraftblow':1,
  'minecraftfinest':1,
  'minecraftuniverse':1,
  'miniladdd':1,
  'miniminter':1,
  'minnesotaburns':1,
  'minnie':1,
  'mkiceandfire':1,
  'mlg':1,
  'mm7games':1,
  'mmohut':1,
  'mmoxreview':1,
  'mod3rnst3pny':1,
  'moldova':1,
  'morealia':1,
  'mortalkombat':1,
  'mr burns':1,
  'mr.bean':1,
  'mr.popo':1,
  'mrchesterccj':1,
  'mrdalekjd':1,
  'mredxwx':1,
  'mrlev12':1,
  'mrlololoshka':1,
  'mrvertez':1,
  'mrwoofless':1,
  'multirawen':1,
  'munchingorange':1,
  'n64':1,
  'naga':1,
  'namcobandaigameseu':1,
  'nasa':1,
  'natusvinceretv':1,
  'nauru':1,
  'nazi':1,
  'nbgi':1,
  'needforspeed':1,
  'nepenthez':1,
  'nextgentactics':1,
  'nextgenwalkthroughs':1,
  'ngtzombies':1,
  'nick fury':1,
  'nick':1,
  'nickelodeon':1,
  'niichts':1,
  'nintendo':1,
  'nintendocaprisun':1,
  'nintendowiimovies':1,
  'nipple':1,
  'nislt':1,
  'nobodyepic':1,
  'node':1,
  'noobfromua':1,
  'northbrabant':1,
  'northernlion':1,
  'norunine':1,
  'nosmoking':1,
  'notch':1,
  'nsa':1,
  'obama':1,
  'obey':1,
  'officialclashofclans':1,
  'officialnerdcubed':1,
  'oficialmundocanibal':1,
  'olafvids':1,
  'omfgcata':1,
  'onlyvgvids':1,
  'opticnade':1,
  'osu':1,
  'ouch':1,
  'outsidexbox':1,
  'p3rvduxa':1,
  'packattack04082':1,
  'palau':1,
  'paluten':1,
  'pandaexpress':1,
  'paulsoaresjr':1,
  'pauseunpause':1,
  'pazudoraya':1,
  'pdkfilms':1,
  'peanutbuttergamer':1,
  'pedo':1,
  'pedobear':1,
  'peinto1008':1,
  'peka':1,
  'penguin':1,
  'penguinz0':1,
  'pepe':1,
  'pepsi':1,
  'perpetuumworld':1,
  'pewdiepie':1,
  'pi':1,
  'pietsmittie':1,
  'pig':1,
  'piggy':1,
  'pika':1,
  'pimpnite':1,
  'pinkfloyd':1,
  'pinkstylist':1,
  'pirate':1,
  'piratebay':1,
  'pizza':1,
  'pizzaa':1,
  'plagasrz':1,
  'plantsvszombies':1,
  'playclashofclans':1,
  'playcomedyclub':1,
  'playscopetrailers':1,
  'playstation':1,
  'playstation3gaminghd':1,
  'pockysweets':1,
  'poketlwewt':1,
  'pooh':1,
  'poop':1,
  'popularmmos':1,
  'potato':1,
  'prestonplayz':1,
  'protatomonster':1,
  'prowrestlingshibatar':1,
  'pt':1,
  'pur3pamaj':1,
  'quantum leap':1,
  'question':1,
  'rageface':1,
  'rajmangaminghd':1,
  'retard smile':1,
  'rewind':1,
  'rewinside':1,
  'rezendeevil':1,
  'reziplaygamesagain':1,
  'rfm767':1,
  'riffer333':1,
  'robbaz':1,
  'rockalone2k':1,
  'rockbandprincess1':1,
  'rockstar':1,
  'rockstargames':1,
  'rojov13':1,
  'rolfharris':1,
  'roomba':1,
  'roosterteeth':1,
  'roviomobile':1,
  'rspproductionz':1,
  'rss':1,
  'rusgametactics':1,
  'ryukyu':1,
  's.h.e.i.l.d':1,
  'sah4rshow':1,
  'samoa':1,
  'sara12031986':1,
  'sarazarlp':1,
  'satan':1,
  'saudi arabia':1,
  'scream':1,
  'screwattack':1,
  'seal':1,
  'seananners':1,
  'serbia':1,
  'serbiangamesbl':1,
  'sethbling':1,
  'sharingan':1,
  'shell':1,
  'shine':1,
  'shofu':1,
  'shrek':1,
  'shufflelp':1,
  'shurikworld':1,
  'shuuya007':1,
  'sinistar':1,
  'siphano13':1,
  'sir':1,
  'skillgaming':1,
  'skinspotlights':1,
  'skkf':1,
  'skull':1,
  'skydoesminecraft':1,
  'skylandersgame':1,
  'skype':1,
  'skyrim':1,
  'slack':1,
  'slovakia':1,
  'slovenia':1,
  'slowpoke':1,
  'smash':1,
  'smikesmike05':1,
  'smoothmcgroove':1,
  'smoove7182954':1,
  'smoshgames':1,
  'snafu':1,
  'snapchat':1,
  'snoop dogg':1,
  'soccer':1,
  'soliare':1,
  'solomid':1,
  'somalia':1,
  'sp4zie':1,
  'space ace':1,
  'space':1,
  'sparklesproduction':1,
  'sparkofphoenix':1,
  'spawn':1,
  'speedyw03':1,
  'speirstheamazinghd':1,
  'spiderman':1,
  'spongegar':1,
  'spore':1,
  'spqr':1,
  'spy':1,
  'squareenix':1,
  'squirtle':1,
  'ssohpkc':1,
  'sssniperwolf':1,
  'ssundee':1,
  'stalinjr':1,
  'stampylonghead':1,
  'star wars rebel':1,
  'starbucks':1,
  'starchild':1,
  'starrynight':1,
  'staxxcraft':1,
  'stitch':1,
  'stupid':1,
  'summit1g':1,
  'sunface':1,
  'superevgexa':1,
  'superman':1,
  'superskarmory':1,
  'swiftor':1,
  'swimmingbird941':1,
  'syria':1,
  't3ddygames':1,
  'tackle4826':1,
  'taco':1,
  'taltigolt':1,
  'tasselfoot':1,
  'tazercraft':1,
  'tbnrfrags':1,
  'tctngaming':1,
  'teamfortress':1,
  'teamgarrymoviethai':1,
  'teammojang':1,
  'terrorgamesbionic':1,
  'tetraninja':1,
  'tgn':1,
  'the8bittheater':1,
  'thealvaro845':1,
  'theatlanticcraft':1,
  'thebajancanadian':1,
  'thebraindit':1,
  'thecraftanos':1,
  'thedanirep':1,
  'thedeluxe4':1,
  'thediamondminecart':1,
  'theescapistmagazine':1,
  'thefantasio974':1,
  'thegaminglemon':1,
  'thegrefg':1,
  'thejoves':1,
  'thejwittz':1,
  'themasterov':1,
  'themaxmurai':1,
  'themediacows':1,
  'themrsark':1,
  'thepolishpenguinpl':1,
  'theradbrad':1,
  'therelaxingend':1,
  'therpgminx':1,
  'therunawayguys':1,
  'thesims':1,
  'theskylanderboy':1,
  'thesw1tcher':1,
  'thesyndicateproject':1,
  'theuselessmouth':1,
  'thewillyrex':1,
  'thnxcya':1,
  'thor':1,
  'tintin':1,
  'tmartn':1,
  'tmartn2':1,
  'tobygames':1,
  'tomo0723sw':1,
  'tonga':1,
  'topbestappsforkids':1,
  'totalhalibut':1,
  'touchgameplay':1,
  'transformer':1,
  'transformers':1,
  'trickshotting':1,
  'triforce':1,
  'trollarchoffice':1,
  'trollface':1,
  'trumpsc':1,
  'tubbymcfatfuck':1,
  'turkey':1,
  'tv':1,
  'tvddotty':1,
  'tvongamenet':1,
  'twitch':1,
  'twitter':1,
  'twosyncfifa':1,
  'typicalgamer':1,
  'uberdanger':1,
  'uberhaxornova':1,
  'ubisoft':1,
  'uguu':1,
  'ukip':1,
  'ungespielt':1,
  'uppercase':1,
  'uruguay':1,
  'utorrent':1,
  'vanossgaming':1,
  'vatican':1,
  'venomextreme':1,
  'venturiantale':1,
  'videogamedunkey':1,
  'videogames':1,
  'vietnam':1,
  'vikkstar123':1,
  'vikkstar123hd':1,
  'vintagebeef':1,
  'virus':1,
  'vladnext3':1,
  'voat':1,
  'voyager':1,
  'vsauce3':1,
  'w1ldc4t43':1,
  'wakawaka':1,
  'wales':1,
  'walrus':1,
  'wazowski':1,
  'wewlad':1,
  'white  light':1,
  'whiteboy7thst':1,
  'whoyourenemy':1,
  'wiiriketopray':1,
  'willyrex':1,
  'windows':1,
  'wingsofredemption':1,
  'wit my woes':1,
  'woodysgamertag':1,
  'worldgamingshows':1,
  'worldoftanks':1,
  'worldofwarcraft':1,
  'wowcrendor':1,
  'wqlfy':1,
  'wroetoshaw':1,
  'wwf':1,
  'wykop':1,
  'xalexby11':1,
  'xbox':1,
  'xboxviewtv':1,
  'xbulletgtx':1,
  'xcalizorz':1,
  'xcvii007r1':1,
  'xjawz':1,
  'xmandzio':1,
  'xpertthief':1,
  'xrpmx13':1,
  'xsk':1,
  'yamimash':1,
  'yarikpawgames':1,
  'ycm':1,
  'yfrosta':1,
  'yinyang':1,
  'ylilauta':1,
  'ylilautaa':1,
  'yoba':1,
  'yobaa':1,
  'yobaaa':1,
  'yogscast2':1,
  'yogscastlalna':1,
  'yogscastsips':1,
  'yogscastsjin':1,
  'yoteslaya':1,
  'youalwayswin':1,
  'yourheroes':1,
  'yourmom':1,
  'youtube':1,
  'zackscottgames':1,
  'zangado':1,
  'zazinombies':1,
  'zeecrazyatheist':1,
  'zeon':1,
  'zerkaahd':1,
  'zerkaaplays':1,
  'zexyzek':1,
  'zimbabwe':1,
  'zng':1,
  'zoella':1,
  'zoidberg':1,
  'zombey':1,
  'zoomingames':1
};

var settings = {
  hideNames: false,
  hideMass: false,
  hideSkins: false,
  hideLeader: false,
  hideMap: false,
};

// Scale
var scale = 0.5, // Rendered Scale 
    scale_ = 0.5, // Animation
    scaleZoom = 1; // Zoom multiplier

world.onleaderschange = function (new_leaders) {
  if ($leaderboard) {
    $leaderboard.html("<p class='leaderboard-header'>Cell Town's Finest</p>");

    new_leaders.forEach(function (leader) {
      if (window.spec.myCells[leader.id]) {
        $leaderboard.append("<li class='leader'>" + (leader.name||"An Unnamed Cell") + "</li>");
      } else {
        $leaderboard.append("<li>" + (leader.name||"An Unnamed Cell") + "</li>");
      }
      
    });
  }
};

function canvasResizeHandler() {
  width = $(window).width();
  height = $(window).height();
  $canvas[0].width = width;
  $canvas[0].height = height;

  mp.style.top = (height - 210) + "px";
  mp.style.left = (width - 210) + "px";
}

function start() {
  spec = new AgarClient(world, false);

  window.onmousemove=function(e){
    window.spec.mX_ = e.clientX;
    window.spec.mY_ = e.clientY;
  };
  window.onkeydown = function(e){
    var x = e.which || e.keyCode;
    switch(x) {
      case 87: // W
        spec.sendCommand(21);
        break;
      case 32: // Space
        spec.sendCommand(17);
        break;
      case 81: // Q
        spec.sendCommand(18);
        break;
      case 27: // Esc
        $(".bogart").toggle(1000);  
        $("#form-main").fadeToggle(1000);
        break;
    }
  }
  // Zoom
  window.onmousewheel=function(e){
      // Detect zoom
      if (e.wheelDelta > 0) {
        scaleZoom *= 1.1;
      } else {
        scaleZoom *= 0.92;
      }

      // Limits
      scaleZoom = scaleZoom > 2 ? 2 : (scaleZoom < 0.5 ? 0.5 : scaleZoom);
  };
  // Settings
  $('#settings-title').on('mousedown', null, function(e) {
      $('#form-settings').addClass('draggable').on('mousemove', function(e) {
          $('.draggable').offset({
              top: e.pageY - $('#settings-title').outerHeight() / 2,
              left: e.pageX - $('#settings-title').outerWidth() / 2
          }).on('mouseup', function() {
              $('#form-settings').removeClass('draggable');
          });
      });
      e.preventDefault();
  }).on('mouseup', function() {
      $('.draggable').removeClass('draggable');
  });
  // Checkbox
  $('#hideNames').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
  });
  $('#hideMass').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
  });
  $('#hideSkins').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
  });
  $('#hideLeader').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
    if (settings.hideLeader) {
      $leaderboard.css('display', 'none');
    } else {
      $leaderboard.css('display', 'block');
    }
  });
  $('#hideMap').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
    if (settings.hideMap) {
      $('#minimap').css('display', 'none');
    } else {
      $('#minimap').css('display', 'block');
    }
  });
}

function drawArrow(ctx, x, y, dx, dy) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x+dx, y+dy);
  ctx.stroke();
}

function render(t) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Animate Scale
  if (scale_ != scale) {
    scale += (scale_ - scale) / 20.0;
  }

  // Set scale
  ctx.scale(scale,scale);

  if (spec) {
    // Calcualate center
    var cx = 0, cy = 0, size = 0, count = 0;
    for (var i in spec.myCells) {
      if (world.objects[i]) {
        var o = world.objects[i];
        cx += o.x;
        cy += o.y;
        size += o.size;
        count++;
      } 
    }

    // Caculate center if the player is alive
    if (count != 0) {
      // Get center
      spec.x = cx/count;
      spec.y = cy/count;

      // Set base scale
      scale_ = Math.pow(Math.min(64.0 / size, 1), 0.4) * Math.max(window.innerHeight / 1080, window.innerWidth / 1920) * scaleZoom;

      /* trying to add some background movement/parallax
      var bgx = (world.width) - (spec.x * window.scale_x);
      var bgy = (world.height) - (spec.y * window.scale_y);
      document.body.style.backgroundPosition = bgx + "px " + bgy + "px";
      */
    }

    // Translate canvas
    offsetX = ((width/2) / scale) - spec.x; 
    offsetY = ((height/2) / scale) - spec.y;
    ctx.translate(offsetX,offsetY);
  }

  // Minimap
  if (!settings.hideMap) {
    minimap.clearRect(0, 0, mp.width, mp.height);
    minimap.fillStyle = "rgb(0,0,0)";
    minimap.globalAlpha = .6;
    minimap.fillRect(0, 0, mp.width, mp.height);
  }

  // Objects
  var sorted = world.sorted;
  for (var i = sorted.length - 1; i > -1; i--) {
    var o = sorted[i];
    // Draw
    o.draw(ctx);

    // Animation smoothing
    if (o.animate) {
      o.x += (o.x_ - o.x) / 4.0;
      o.y += (o.y_ - o.y) / 4.0;
      o.size += (o.size_ - o.size) / 6.0;
    }
  }

  // Send mouse position if socket is connected
  if (spec.isConnected) {
    // Get mouse positions on canvas
    spec.mX = (spec.mX_ / scale) - offsetX;
    spec.mY = (spec.mY_ / scale) - offsetY;

    // Send positions
    spec.sendDirection();
  }
  
  // Restore
  ctx.restore();

  window.requestAnimationFrame(render);
}

if (typeof window !== "undefined") {
  $(function () {
    $canvas = $("#canvas");
    ctx = $canvas[0].getContext("2d");
    mp = document.getElementById("minimap");
    minimap = mp.getContext("2d");
    $(window).resize(canvasResizeHandler);
    canvasResizeHandler();

    $leaderboard = $("#leaderboard");

    window.requestAnimationFrame(render);

    // Start
    start();

    $("#open").click(function () {
      // Set variables
      var url = $("#url").val();
      spec.nickname = $("#name").val();

      if (world.url == url) {
        // Same server, dont reconnect
        spec.sendNick();
      } else {
        // Different server, lets connect to it
        if (spec.socket) {
          // Close any existing connections first
          spec.end();
        }

        // Connect
        spec.connect(url);

        // Finish
        world.url = url;
      }

      // Close menu
      $(".bogart").hide(1000);  
      $("#form-main").fadeOut(1000);
    });

    // On close
    $("#close").click(function () {
      if (spec !== null) {
        spec.end();
      }

      $("#url").show();
      $("#open").show();
      $("#close").hide();
      world.objects = {};
      names = {};
    });

    // 
    $(".open-settings").click(function () {
      $("#form-settings").toggle(1000);
    });
  });
} else {
  start();
}
