import sys, os
import logging
import logging.handlers

logger = logging.getLogger('monitor')
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(funcName)s] %(message)s')
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(formatter)
logger.addHandler(handler)
handlerr = logging.StreamHandler()
handlerr.setFormatter(formatter)
handlerr.setLevel(logging.WARNING)
logger.addHandler(handlerr)

f = os.path.normpath(os.path.join(os.path.dirname(__file__).split('src')[0],'./logging/monitor.log'))
if (not os.path.exists(os.path.dirname(f))):
    os.makedirs(os.path.dirname(f))
#handlerf = logging.FileHandler(f)
handlerf = logging.handlers.TimedRotatingFileHandler(f, when='midnight', backupCount=7, utc=True)
handlerf.setFormatter(formatter)
handlerf.setLevel(logging.DEBUG)
logger.addHandler(handlerf)
