(ns promise-list.util
   (:use [jayq.util :only [log]]))

(defn transparent-log [v]
  (log (clj->js v))
  v)
