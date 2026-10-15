import logging

logging.basicConfig(level=logging.DEBUG, format="%(levelname)-8s %(name)s: %(message)s")
log = logging.getLogger("library")


def borrow(stock, title):
    log.debug("borrow(%r) called; stock=%r", title, stock)
    if stock.get(title, 0) == 0:
        log.warning("%s is not available", title)
        return False
    stock[title] -= 1
    log.info("lent out %s; %d left", title, stock[title])
    return True


stock = {"Dune": 1}
borrow(stock, "Dune")
borrow(stock, "Dune")
logging.getLogger().setLevel(logging.WARNING)     # from now on, only warnings and worse
borrow(stock, "Emma")
borrow(stock, "Dune")
