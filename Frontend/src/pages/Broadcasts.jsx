import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaBroadcastTower, FaCalendar, FaClock, FaNewspaper } from 'react-icons/fa';

const Broadcasts = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all

  // Fetch broadcasts
  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const response = await api.get('/broadcasts');
        setBroadcasts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching broadcasts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBroadcasts();
  }, []);

  const now = new Date();

  const filteredBroadcasts = broadcasts.filter(broadcast => {
    const airDate = new Date(broadcast.airDate);
    if (filter === 'upcoming') return airDate > now;
    if (filter === 'past') return airDate <= now;
    return true;
  }).sort((a, b) => new Date(a.airDate) - new Date(b.airDate));

  const getStatusBadge = (airDate) => {
    const date = new Date(airDate);
    const isUpcoming = date > now;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isUpcoming
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isUpcoming ? 'Upcoming' : 'Aired'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading broadcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Broadcast Schedule</h1>
          <p className="text-lg text-gray-600">
            Stay updated with our latest broadcast schedules and aired content
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past Broadcasts' },
            { key: 'all', label: 'All' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredBroadcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBroadcasts.map((broadcast) => (
              <div
                key={broadcast._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Broadcast Header */}
                <div className="bg-linear-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaBroadcastTower className="text-white text-xl mr-3" />
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {broadcast.channelName}
                        </h3>
                        {getStatusBadge(broadcast.airDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Broadcast Details */}
                <div className="p-6">
                  {/* Air Date and Time */}
                  <div className="mb-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaCalendar className="mr-2 text-blue-600" />
                      <span className="text-sm">
                        {new Date(broadcast.airDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2 text-blue-600" />
                      <span className="text-sm">
                        {new Date(broadcast.airDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  {broadcast.duration && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Duration:</span>
                      <span className="ml-2 text-sm text-gray-600">{broadcast.duration}</span>
                    </div>
                  )}

                  {/* Associated Article */}
                  {broadcast.article && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-start">
                        <FaNewspaper className="text-green-600 mt-1 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            Featured Article
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {broadcast.article.title}
                          </p>
                          {broadcast.article.summary && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {broadcast.article.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(broadcast.airDate) > now
                          ? `Airs in ${Math.ceil((new Date(broadcast.airDate) - now) / (1000 * 60 * 60 * 24))} days`
                          : `Aired ${Math.ceil((now - new Date(broadcast.airDate)) / (1000 * 60 * 60 * 24))} days ago`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBroadcastTower className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No broadcasts found
            </h3>
            <p className="text-gray-600">
              {filter === 'upcoming'
                ? 'There are no upcoming broadcasts scheduled.'
                : filter === 'past'
                ? 'There are no past broadcasts to display.'
                : 'There are no broadcasts available.'
              }
            </p>
          </div>
        )}

        {/* Broadcast Statistics */}
        {broadcasts.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Broadcast Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {broadcasts.filter(b => new Date(b.airDate) > now).length}
                </div>
                <div className="text-gray-600">Upcoming Broadcasts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {broadcasts.filter(b => new Date(b.airDate) <= now).length}
                </div>
                <div className="text-gray-600">Completed Broadcasts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {broadcasts.length}
                </div>
                <div className="text-gray-600">Total Broadcasts</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Broadcasts;
