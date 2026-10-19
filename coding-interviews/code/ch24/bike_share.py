"""Chapter 24 worked example: a bike-share system.

Riders rent bikes from docking stations and return them to any station
with a free dock. Electric bikes cost more. Members pay a lower rate
than casual riders. Fees are in cents; times are in minutes.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum


class BikeKind(Enum):
    CLASSIC = "classic"
    ELECTRIC = "electric"


@dataclass
class Bike:
    bike_id: str
    kind: BikeKind


@dataclass
class Station:
    station_id: str
    capacity: int
    bikes: list = field(default_factory=list)

    def has_free_dock(self):
        return len(self.bikes) < self.capacity

    def take(self, kind):
        for i, bike in enumerate(self.bikes):
            if bike.kind == kind:
                return self.bikes.pop(i)
        return None

    def dock(self, bike):
        if not self.has_free_dock():
            raise ValueError(f"station {self.station_id} is full")
        self.bikes.append(bike)


class PricingPlan(ABC):
    @abstractmethod
    def fee(self, kind, minutes):
        """The fee in cents for one ride."""


class PayPerRide(PricingPlan):
    UNLOCK = 100
    PER_MINUTE = {BikeKind.CLASSIC: 20, BikeKind.ELECTRIC: 40}

    def fee(self, kind, minutes):
        return self.UNLOCK + self.PER_MINUTE[kind] * minutes


class Membership(PricingPlan):
    FREE_MINUTES = 45  # classic rides up to this length are included
    OVER_PER_MINUTE = 20  # classic minutes beyond the free ones
    ELECTRIC_PER_MINUTE = 15

    def fee(self, kind, minutes):
        if kind == BikeKind.ELECTRIC:
            return self.ELECTRIC_PER_MINUTE * minutes
        return self.OVER_PER_MINUTE * max(0, minutes - self.FREE_MINUTES)


@dataclass
class Rider:
    name: str
    plan: PricingPlan


@dataclass
class Ride:
    bike: Bike
    start: int


class BikeShare:
    def __init__(self):
        self.stations = {}
        self.active = {}  # rider name -> current Ride

    def add_station(self, station_id, capacity, bikes=()):
        station = Station(station_id, capacity)
        for bike in bikes:
            station.dock(bike)
        self.stations[station_id] = station

    def rent(self, rider, station_id, kind, now):
        if rider.name in self.active:
            raise ValueError(f"{rider.name} already has a bike")
        bike = self.stations[station_id].take(kind)
        if bike is None:
            raise ValueError(f"no {kind.value} bike at {station_id}")
        self.active[rider.name] = Ride(bike, now)
        return bike.bike_id

    def give_back(self, rider, station_id, now):
        ride = self.active.get(rider.name)
        if ride is None:
            raise ValueError(f"{rider.name} has no bike")
        self.stations[station_id].dock(ride.bike)  # raises if full
        del self.active[rider.name]
        return rider.plan.fee(ride.bike.kind, now - ride.start)


def demo():
    share = BikeShare()
    share.add_station(
        "Harbor",
        3,
        [Bike("C1", BikeKind.CLASSIC), Bike("E1", BikeKind.ELECTRIC)],
    )
    share.add_station("Museum", 1)
    ana = Rider("Ana", PayPerRide())
    ben = Rider("Ben", Membership())
    print(share.rent(ana, "Harbor", BikeKind.ELECTRIC, now=0))
    print(share.rent(ben, "Harbor", BikeKind.CLASSIC, now=5))
    print(share.give_back(ana, "Museum", now=12))  # 100 + 12 * 40
    try:
        share.give_back(ben, "Museum", now=30)
    except ValueError as err:
        print("error:", err)
    print(share.give_back(ben, "Harbor", now=65))  # 60 min: 15 over


def test():
    share = BikeShare()
    share.add_station("A", 2, [Bike("C1", BikeKind.CLASSIC)])
    share.add_station("B", 1, [Bike("E1", BikeKind.ELECTRIC)])
    casual, member = Rider("c", PayPerRide()), Rider("m", Membership())
    assert share.rent(casual, "A", BikeKind.CLASSIC, 0) == "C1"
    for bad in [
        lambda: share.rent(casual, "B", BikeKind.ELECTRIC, 1),  # has one
        lambda: share.rent(member, "A", BikeKind.CLASSIC, 1),  # none left
        lambda: share.give_back(member, "A", 2),  # not riding
        lambda: share.give_back(casual, "B", 3),  # B is full
    ]:
        try:
            bad()
        except ValueError:
            pass
        else:
            raise AssertionError("expected ValueError")
    assert share.give_back(casual, "A", 10) == 100 + 20 * 10
    assert share.rent(member, "B", BikeKind.ELECTRIC, 10) == "E1"
    assert share.give_back(member, "A", 30) == 15 * 20
    assert Membership().fee(BikeKind.CLASSIC, 45) == 0
    assert Membership().fee(BikeKind.CLASSIC, 46) == 20
    assert [b.bike_id for b in share.stations["A"].bikes] == ["C1", "E1"]
    assert not share.active
